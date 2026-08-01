import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type UserConfig } from 'tsdown';

/**
 * Reads the `exports` map from a package's `package.json` and returns the source
 * files that should become tsdown entry points. The returned object is suitable
 * for tsdown's `entry` option: `{ "./foo": "./src/foo/index.ts", ... }`.
 *
 * Both `import` and `require` conditions are scanned — the dual build emits
 * one tsdown entry per export subpath, with both runtimes generated from the
 * same source. `types` is deliberately skipped because it points at the
 * declaration file, not a source file.
 */
function deriveEntries(packageDir: string): Record<string, string> {
	const pkgPath = resolve(packageDir, 'package.json');
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
		exports?: Record<string, unknown>;
	};

	if (!pkg.exports) {
		throw new Error(
			`Package at ${packageDir} is missing an "exports" field. ` +
				`Add one before configuring tsdown.`,
		);
	}

	const entries: Record<string, string> = {};
	const distRoot = resolve(packageDir, 'dist');

	for (const [key, value] of Object.entries(pkg.exports)) {
		if (typeof value !== 'object' || value === null) continue;

		// Pick the first runtime target that resolves into this package's
		// dist tree. Prefer the `import` condition, then `require`, then
		// `default`. Skipping `types` here is critical — it points at the
		// declaration file, and resolving it would generate a useless entry.
		const cond = value as Record<string, string>;
		const runtimeTarget = cond.import ?? cond.require ?? cond.default;
		if (!runtimeTarget) continue;

		// Only consider entries that live in this package's dist tree.
		const stripped = runtimeTarget.replace(/^\.\/dist/, '');
		const resolved = resolve(distRoot, `.${stripped}`);
		if (!resolved.startsWith(distRoot)) continue;

		// Map "./foo/bar" → "./src/foo/bar/index.ts". The entry name is the export
		// subpath with a `/index` suffix preserved, so tsdown emits each chunk
		// at `dist/<subpath>/index.{mjs,cjs,d.mts,d.cts}` — exactly where
		// `package.json#exports` expects it. (Without the `/index` suffix,
		// tsdown flattens the path to `dist/<subpath>.{mjs,cjs}`, which would
		// silently break consumers.) The root entry (`"."`) is special: it maps
		// to `dist/index.{mjs,cjs}`.
		const withoutLeadingDot = key === '.' ? '' : key.replace(/^\.\//, '');
		const srcEntry =
			withoutLeadingDot === '' ? './src/index.ts' : `./src/${withoutLeadingDot}/index.ts`;
		const entryName = withoutLeadingDot === '' ? 'index' : `${withoutLeadingDot}/index`;
		entries[entryName] = srcEntry;
	}

	if (Object.keys(entries).length === 0) {
		throw new Error(
			`Could not derive any tsdown entry points from ${pkgPath}#exports. ` +
				`Expected at least a "." entry pointing at "./dist/index.{mjs,cjs}".`,
		);
	}

	return entries;
}

/**
 * Returns the path to the package directory this build is for. tsdown invokes
 * the config file with the package's `cwd` as `process.cwd()`, so we can rely
 * on that directly. Override is provided for tests.
 */
function packageDir(override?: string): string {
	return override ?? process.cwd();
}

/**
 * Shared tsdown configuration for every publishable package in the monorepo.
 *
 * Why this exists:
 * - Dual-package output: ESM (`.mjs`) + CJS (`.cjs`) + matching types
 *   (`.d.mts` / `.d.cts`) from a single source tree. Consumers on either
 *   module system get correct file extensions and types.
 * - Sourcemaps for every emitted artifact.
 * - Unbundle mode preserves the source layout, which keeps `exports` paths
 *   honest and lets consumers tree-shake unused subentries.
 * - `clean: true` guarantees a pristine `dist/` on every build.
 *
 * Per-package configs should `import { definePackageConfig } from
 * '../../tsdown.config.base'` and re-export the resolved config — they only
 * need to provide package-specific overrides, which today is "nothing".
 */
export function definePackageConfig(
	overrides: Partial<UserConfig> = {},
	pkgDir: string = packageDir(),
): ReturnType<typeof defineConfig> {
	const entry = deriveEntries(pkgDir);
	const pkgName = JSON.parse(readFileSync(resolve(pkgDir, 'package.json'), 'utf8')) as {
		name: string;
	};

	return defineConfig({
		// Dual-package output: ESM and CJS in one tsdown run. tsdown writes
		// `.mjs` for ESM and `.cjs` for CJS by default — both are exact
		// matches for the `exports` condition paths below.
		format: ['esm', 'cjs'],
		dts: {
			sourcemap: true,
			// Emit both `.d.mts` (ESM types) and `.d.cts` (CJS types). This
			// requires `declaration: true`, which is set here rather than in
			// `tsconfig.base.json` so `tsc --noEmit` typechecks don't trip on
			// TypeScript's "isolatedDeclarations requires declaration" rule.
			compilerOptions: {
				isolatedDeclarations: true,
				declaration: true,
			},
		},
		sourcemap: true,

		// Pristine `dist/` every build — no stale artifacts from a previous
		// (different-shape) build leaking through.
		clean: true,

		// Preserve the source-tree layout of `src/` in `dist/`. This is what
		// keeps `exports: { "./device": "./dist/device/index.mjs" }` honest
		// and — critically — keeps each entry point a separate file, so
		// consumers tree-shake unused subentries instead of pulling in the
		// world.
		unbundle: true,

		// We target the Node version declared in `engines.node` so output is
		// modern but still runs on the documented floor.
		platform: 'node',

		// Library hygiene: no node-protocol rewriting (we don't import `node:*`
		// anywhere yet, but if a package starts to we want the literal prefix).
		nodeProtocol: false,

		// Surfacing the package name makes multi-package build logs readable.
		name: pkgName.name,

		entry,
		...overrides,
	});
}

export type { UserConfig };
