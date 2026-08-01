#!/usr/bin/env node

/**
 * Copies the workspace `LICENSE` into a package directory before publishing.
 *
 * Every published package should include a copy of the repository license to
 * satisfy npm package distribution requirements while keeping a single source
 * of truth at the workspace root.
 *
 * Usage:
 *   node scripts/copy-package-meta.mjs -t <full path to package-dir>
 *   for example: "node scripts/copy-package-meta.mjs -t packages/core"
 *
 * Options:
 *   -t, --target   Package directory to receive the LICENSE (required).
 *   -h, --help     Display this help message.
 *
 * Characteristics:
 * - Idempotent: Safe to run multiple times.
 * - Overwrites any existing LICENSE in the target directory.
 * - Fails fast with clear error messages for invalid inputs.
 */

import { copyFileSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_NAME = 'copy-package-meta';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(workspaceRoot, 'LICENSE');

function exitWithError(message) {
	console.error(`${SCRIPT_NAME}: ${message}`);
	process.exit(1);
}

function printHelp() {
	console.log(`
Copies the workspace LICENSE into a package directory.

Usage:
  node scripts/copy-package-meta.mjs -t <package-dir>

Options:
  -t, --target   Package directory to receive the LICENSE.
  -h, --help     Display this help message.

Examples:
  node scripts/copy-package-meta.mjs -t packages/core
  node scripts/copy-package-meta.mjs --target packages/nodes-base
`);
	process.exit(0);
}

/**
 * CLI Argument Parsing Logic
 *
 * This script is intended to be run from the command line with a target
 * package directory. It validates the input and provides helpful error
 * messages for incorrect usage.
 */

const args = process.argv.slice(2);
let targetArg;

for (let i = 0; i < args.length; i++) {
	switch (args[i]) {
		case '-t':
		case '--target':
			targetArg = args[++i];

			/**
			 * Prevent treating another flag (or a missing value) as the target
			 * directory, which would lead to confusing filesystem errors.
			 */
			if (!targetArg || targetArg.startsWith('-')) {
				exitWithError('--target requires a package directory.\nRun with --help for usage.');
			}
			break;

		case '-h':
		case '--help':
			printHelp();
			break;

		default:
			exitWithError(`unknown argument "${args[i]}".\nRun with --help for usage.`);
	}
}

if (!targetArg) {
	exitWithError('missing required option: --target.\nRun with --help for usage.');
}

const targetDir = resolve(workspaceRoot, targetArg);
const destination = resolve(targetDir, 'LICENSE');

/**
 * Publishing should fail immediately if the package directory doesn't exist,
 * rather than silently copying to an unexpected location.
 */
if (!existsSync(targetDir)) {
	exitWithError(`target directory does not exist:\n${targetDir}`);
}

/**
 * Ensure the target is actually a directory before attempting to copy files.
 */
if (!statSync(targetDir).isDirectory()) {
	exitWithError(`target is not a directory:\n${targetDir}`);
}

/**
 * The workspace LICENSE is the canonical source. Publishing without it would
 * produce packages missing their license.
 */
if (!existsSync(source)) {
	exitWithError(`workspace LICENSE not found:\n${source}`);
}

try {
	copyFileSync(source, destination);
	console.log(`${SCRIPT_NAME}: copied LICENSE → ${destination}`);
} catch (error) {
	exitWithError(
		`failed to copy LICENSE:\n${error instanceof Error ? error.message : String(error)}`,
	);
}
