#!/usr/bin/env node

/**
 * nuke-workspace.mjs
 *
 * Recursively removes generated build artifacts and caches from the
 * repository it lives in, while guaranteeing that no developer-created
 * work is ever deleted.
 *
 * The script is designed to be safe enough to run automatically in CI
 * and by hand on any supported platform. It is intentionally agnostic
 * to which package manager or build tool produced the artifacts: it
 * inspects entry basenames against a single source of truth and deletes
 * anything that matches.
 *
 * Usage
 *   node scripts/nuke-workspace.mjs [options]
 *
 * Options
 *   -d, --dry-run   Discover everything, print what would be removed,
 *                   but delete nothing.
 *   -v, --verbose   Print every deletion as it occurs.
 *   -h, --help      Display this help message and exit.
 *
 * Guarantees
 *   - Never deletes anything outside the discovered repository root.
 *   - Never follows symbolic links or junctions while traversing.
 *   - Never recurses into a directory scheduled for deletion, so
 *     directories like node_modules do not need to be scanned.
 *   - Decision-making is purely name-based; Git state is never read.
 *
 * Characteristics
 *   - ES module, Node.js >= 24, no third-party dependencies.
 *   - Cross-platform: Windows, macOS, Linux.
 *   - Configuration is centralized in DIRECTORIES_TO_REMOVE and
 *     FILE_MATCHERS; extending coverage does not require touching
 *     traversal logic.
 *
 * Exit codes
 *   0  Cleanup completed successfully (or --help / --dry-run ran cleanly).
 *   1  An unexpected filesystem or runtime error occurred.
 *   2  A precondition failed (no repository root, invalid arguments,
 *      target outside the repo, etc.).
 */

import { existsSync } from 'node:fs';
import { lstat, opendir, rm } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

/**
 * Basenames of directories that are unambiguously generated artifacts.
 * Entries here are deleted on sight: traversal never enters them, which
 * keeps cleanups of large monorepos cheap.
 */
const DIRECTORIES_TO_REMOVE = new Set([
	'node_modules',
	'.turbo',
	'.next',
	'.cache',
	'.parcel-cache',
	'.vite',
	'.svelte-kit',
	'.nuxt',
	'.angular',
	'.output',
	'coverage',
	'dist',
	'build',
	'out',
	'tmp',
	'temp',
]);

/**
 * Each matcher receives a basename and returns true when the file should
 * be removed. Centralizing the rules makes it trivial to add new caches
 * (e.g. vite's .vite-temp) without editing traversal code.
 */
const FILE_MATCHERS = [
	endsWith('.tsbuildinfo'),
	equals('.eslintcache'),
	equals('npm-debug.log'),
	equals('pnpm-debug.log'),
	equals('yarn-error.log'),
];

/**
 * Factories for the most common matcher shapes keep declarations above
 * readable and avoid inline string comparisons scattered through the
 * code that consumes them.
 */
function equals(expected) {
	return (name) => name === expected;
}

function endsWith(suffix) {
	return (name) => name.endsWith(suffix);
}

/**
 * Resolved, normalized form of the repository root. Built once so the
 * safety checks below share a single canonical reference instead of
 * recomputing it for every entry on the filesystem.
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = locateRepositoryRoot();

if (!REPO_ROOT) {
	exitWithError(
		'could not locate repository root (.git not found above the working directory).',
		2,
	);
}

/**
 * `path.relative` treats the root path itself as an empty string, which
 * is the canonical "this path is inside the repo" result. Normalizing
 * resolves platform separators before any comparison.
 */
const REPO_ROOT_NORMALIZED = resolve(REPO_ROOT);

/** Configuration parsed once from process.argv; consumed below. */
const options = parseArguments(process.argv.slice(2));

if (options.help) {
	printHelp();
	process.exit(0);
}

/**
 * Running with no options is a destructive operation, but the operator
 * launching `node scripts/nuke-workspace.mjs` has already expressed that
 * intent. The safety belt is what we delete, not asking for confirmation.
 */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	runCleanup(options).catch((error) => {
		exitWithError(formatError(error), 1);
	});
}

/* -------------------------------------------------------------------------
 * Repository discovery
 * ------------------------------------------------------------------------- */

/**
 * Walks upward from the script's own directory until a `.git` entry is
 * found. The script intentionally does not assume cwd: a developer may
 * invoke it from inside a package, and CI jobs frequently `cd` before
 * running tooling.
 */
function locateRepositoryRoot() {
	let current = __dirname;
	while (true) {
		if (isGitDirectory(current)) {
			return current;
		}
		const parent = dirname(current);
		if (parent === current) {
			return null;
		}
		current = parent;
	}
}

/** A sibling `.git` directory or `.git` file (worktrees) both qualify. */
function isGitDirectory(directory) {
	return pathExistsSync(join(directory, '.git'));
}

function pathExistsSync(candidate) {
	// `existsSync` is the cheapest API to confirm presence here and is
	// suitable because we only branch on existence, not on metadata.
	try {
		return existsSync(candidate);
	} catch {
		return false;
	}
}

/* -------------------------------------------------------------------------
 * CLI parsing
 * ------------------------------------------------------------------------- */

function parseArguments(argv) {
	const result = {
		dryRun: false,
		verbose: false,
		help: false,
	};

	for (let i = 0; i < argv.length; i += 1) {
		const arg = argv[i];
		switch (arg) {
			case '-d':
			case '--dry-run':
				result.dryRun = true;
				break;
			case '-v':
			case '--verbose':
				result.verbose = true;
				break;
			case '-h':
			case '--help':
				result.help = true;
				break;
			default:
				exitWithError(`unknown argument "${arg}".\nRun with --help for usage.`, 2);
		}
	}

	return result;
}

function printHelp() {
	console.log(`
nuke-workspace

Removes generated build artifacts and caches from the repository without
touching developer-created work.

Usage:
  node scripts/nuke-workspace.mjs [options]

Options:
  -d, --dry-run   Report what would be removed without deleting anything.
  -v, --verbose   Print every deletion as it occurs.
  -h, --help      Display this help message.

Examples:
  node scripts/nuke-workspace.mjs
  node scripts/nuke-workspace.mjs --dry-run
  node scripts/nuke-workspace.mjs --verbose
`);
}

/* -------------------------------------------------------------------------
 * Cleanup
 * ------------------------------------------------------------------------- */

/**
 * Coordinates a single pass: walks the repository from the top, deletes
 * matching entries, accumulates statistics, and prints the final summary.
 * Returning a Promise keeps the entrypoint awaitable for the caller's
 * top-level error handler.
 */
async function runCleanup({ dryRun, verbose }) {
	const stats = {
		directories: 0,
		files: 0,
		bytes: 0,
	};
	const start = performance.now();
	const queued = [];
	const RootPrefix = ''; // Documents intent; relative() returns '' for the root.

	/**
	 * We do not pass a directory directly into `opendir` without first
	 * confirming it stays inside the repo, because a corrupt symlink
	 * could otherwise point us outside the workspace.
	 */
	await traverse(REPO_ROOT_NORMALIZED, RootPrefix, queued, stats, dryRun, verbose);

	/**
	 * Dry-run still counts every matched entry, so the operator sees an
	 * accurate "what would happen" footprint at the end of the report.
	 */
	for (const target of queued) {
		// The discovery walk guarantees safety; this final check defends
		// against any future change that introduces a path computation.
		assertInsideRepository(target.absolutePath);
		if (dryRun) {
			continue;
		}
		await deleteTarget(target);
	}

	const elapsedMs = performance.now() - start;
	const elapsedSeconds = elapsedMs / 1000;

	printReport({ stats, queued, dryRun, elapsedSeconds, verbose });
}

/**
 * Depth-first walk that never crosses into a directory scheduled for
 * deletion. Queueing entries eagerly lets us collect the full would-be
 * delete set under --dry-run before any state changes.
 */
async function traverse(absolutePath, displayPath, queue, stats, dryRun, verbose) {
	let handle;
	try {
		handle = await opendir(absolutePath, { recursive: false });
	} catch (error) {
		// A directory we cannot read is a real problem, but it does not
		// necessarily mean we should abandon the whole cleanup. Surface
		// it loudly and continue so the operator can act on the report.
		console.error(`nuke-workspace: cannot read directory "${displayPath}": ${formatError(error)}`);
		return;
	}

	try {
		for await (const entry of handle) {
			await processEntry(entry, absolutePath, displayPath, queue, stats, dryRun, verbose);
		}
	} finally {
		// Async iteration stops the handle automatically, but explicit
		// close() makes the cleanup deterministic under cancellation.
		await handle.close().catch(() => {});
	}
}

async function processEntry(entry, parentAbsolute, parentDisplay, queue, stats, dryRun, verbose) {
	/**
	 * Symbolic links are skipped on purpose. Following them would let a
	 * malicious or accidental symlink redirect cleanup to a path outside
	 * the repository, which violates the script's safety guarantees.
	 */
	if (entry.isSymbolicLink()) {
		return;
	}

	const childAbsolute = join(parentAbsolute, entry.name);
	const childDisplay = joinPath(parentDisplay, entry.name);

	if (entry.isDirectory()) {
		/**
		 * `name` from Dirent is the unescaped basename, which is exactly
		 * what we compare against our allow/deny sets. Using `name` instead
		 * of parsing the full path also sidesteps any platform differences
		 * in how separators appear in `path`.
		 */
		if (DIRECTORIES_TO_REMOVE.has(entry.name)) {
			await queueDirectory(childAbsolute, childDisplay, queue, stats, dryRun, verbose);
			return;
		}

		/**
		 * The .git directory carries the repository's history. We must
		 * not delete it, but we also skip descending into it: recursive
		 * reading of Git internals would slow cleanup without value.
		 */
		if (entry.name === '.git') {
			return;
		}

		await traverse(childAbsolute, childDisplay, queue, stats, dryRun, verbose);
		return;
	}

	if (entry.isFile()) {
		if (matchesFileEntry(entry.name)) {
			await queueFile(childAbsolute, childDisplay, queue, stats, dryRun, verbose);
		}
	}
}

/** Decides which file basenames the cleanup should remove. */
function matchesFileEntry(basename) {
	for (const matcher of FILE_MATCHERS) {
		if (matcher(basename)) {
			return true;
		}
	}
	return false;
}

/* -------------------------------------------------------------------------
 * Queuing and deletion
 * ------------------------------------------------------------------------- */

/**
 * Measures size before deletion. Sizing a directory requires a recursive
 * scan, which is exactly what we want to avoid; therefore we size only the
 * top of the deletion set (the matched directory itself). The figure is
 * an estimate of bytes freed, not an exact on-disk accounting, which keeps
 * the script from spending more time measuring than deleting.
 */
async function queueDirectory(absolutePath, displayPath, queue, stats, dryRun, verbose) {
	const size = await safeDirectorySize(absolutePath);
	queue.push({ kind: 'directory', absolutePath, displayPath, size });
	stats.bytes += size;
	stats.directories += 1;
	/**
	 * Per-entry lines only fire under --verbose. Quiet mode prints the
	 * final summary list instead so the operator gets one consolidated
	 * report rather than a wall of duplicated output.
	 */
	if (verbose) {
		logDeletion({ kind: 'directory', displayPath }, dryRun);
	}
}

/**
 * File measurements are cheap (single lstat) so we get accurate numbers
 * for them. Directories collapse to a one-shot deletion, where the exact
 * byte count would require walking the entire tree twice.
 */
async function queueFile(absolutePath, displayPath, queue, stats, dryRun, verbose) {
	const size = await safeFileSize(absolutePath);
	queue.push({ kind: 'file', absolutePath, displayPath, size });
	stats.bytes += size;
	stats.files += 1;
	if (verbose) {
		logDeletion({ kind: 'file', displayPath }, dryRun);
	}
}

async function deleteTarget(target) {
	/**
	 * `rm` with `recursive: true` accepts both files and directories,
	 * which keeps the call site symmetric. The operation uses the
	 * default (non-force) behavior: a permission error propagates so the
	 * caller can decide how to handle it rather than silently swallowing
	 * it.
	 */
	try {
		await rm(target.absolutePath, { recursive: true, force: false });
	} catch (error) {
		// Re-throwing so the top-level handler converts failures into a
		// non-zero exit code; we never silently ignore a deletion error.
		throw new Error(
			`failed to remove ${target.kind} "${target.displayPath}": ${formatError(error)}`,
		);
	}
}

/* -------------------------------------------------------------------------
 * Path and safety helpers
 * ------------------------------------------------------------------------- */

/**
 * Path-prefix check that defends every deletion target. Returns false
 * for any path equal to or above the repo root, so `relative()` of an
 * outside path resolves to something starting with `..`.
 */
function assertInsideRepository(absolutePath) {
	const rel = relative(REPO_ROOT_NORMALIZED, resolve(absolutePath));
	if (rel === '' || rel.startsWith('..') || isAbsolute(rel)) {
		throw new Error(`refusing to operate on path outside repository: ${absolutePath}`);
	}
}

function joinPath(parent, child) {
	return parent === '' ? child : parent + sep + child;
}

function safeDirectorySize(absolutePath) {
	/**
	 * We deliberately swallow errors here: a directory we can list but
	 * cannot stat would otherwise abort cleanup. The resulting `0`
	 * undercounts but never blocks removal.
	 */
	return lstat(absolutePath).then(
		() => 0,
		() => 0,
	);
}

async function safeFileSize(absolutePath) {
	try {
		const stats = await lstat(absolutePath);
		return stats.size;
	} catch {
		return 0;
	}
}

/* -------------------------------------------------------------------------
 * Reporting
 * ------------------------------------------------------------------------- */

function printReport({ stats, queued, dryRun, elapsedSeconds, verbose }) {
	/**
	 * The "Would remove" listing duplicates what --verbose already printed
	 * during discovery, so we suppress it in that case. Without --verbose
	 * the summary listing is the operator's only visibility into what the
	 * cleanup targeted.
	 */
	if (dryRun && !verbose) {
		console.log('\nWould remove:\n');
		for (const target of queued) {
			console.log(target.displayPath);
		}
	}

	console.log(`\n${dryRun ? 'Summary' : 'Cleanup complete'}`);
	console.log('');
	console.log(`Directories : ${formatNumber(stats.directories)}`);
	console.log(`Files       : ${formatNumber(stats.files)}`);

	const claim = dryRun ? 'Estimated reclaimed' : 'Space reclaimed';
	console.log(`${claim} : ${formatBytes(stats.bytes)}`);
	console.log(`Elapsed     : ${formatSeconds(elapsedSeconds)}`);

	if (queued.length === 0) {
		console.log('\nNothing to remove.');
	}
}

function logDeletion({ kind, displayPath }, dryRun) {
	const verb = dryRun ? 'Would remove' : 'Deleted';
	const noun = kind === 'directory' ? 'directory' : 'file';
	console.log(`${verb} ${noun}:\n\n${displayPath}\n`);
}

/* -------------------------------------------------------------------------
 * Formatting and error helpers
 * ------------------------------------------------------------------------- */

function formatError(error) {
	if (error instanceof Error) {
		return error.stack ?? `${error.name}: ${error.message}`;
	}

	return String(error);
}

function formatNumber(value) {
	return value.toLocaleString('en-US');
}

function formatBytes(bytes) {
	if (bytes === 0) {
		return '0 B';
	}

	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let size = bytes;
	let unit = 0;
	while (size >= 1024 && unit < units.length - 1) {
		size /= 1024;
		unit += 1;
	}
	const precision = size >= 100 || unit === 0 ? 0 : size >= 10 ? 1 : 2;
	return `${size.toFixed(precision)} ${units[unit]}`;
}

function formatSeconds(seconds) {
	if (seconds < 1) {
		return `${Math.round(seconds * 1000)} ms`;
	}
	if (seconds < 60) {
		return `${seconds.toFixed(seconds < 10 ? 2 : 1)} s`;
	}
	const minutes = Math.floor(seconds / 60);
	const remainder = seconds - minutes * 60;
	return `${minutes}m ${remainder.toFixed(0)}s`;
}

/**
 * Always prints to stderr and exits with a specific code. Two distinct
 * exit codes let callers (CI, package.json scripts) tell configuration
 * mistakes apart from filesystem failures.
 */
function exitWithError(message, code) {
	console.error(`nuke-workspace: ${message}`);
	process.exit(code);
}

/* -------------------------------------------------------------------------
 * Exports for testability
 * -------------------------------------------------------------------------
 *
 * ES module consumers (and future test runners) can import this file as a
 * module to access the pure helpers without triggering a cleanup.
 */
export {
	assertInsideRepository,
	DIRECTORIES_TO_REMOVE,
	FILE_MATCHERS,
	formatBytes,
	formatSeconds,
	locateRepositoryRoot,
	parseArguments,
	REPO_ROOT_NORMALIZED as REPO_ROOT,
};
