# Setup Repository Action

A composite action that initializes the repository environment for CI workflows.

## Purpose

Centralizes Node.js, Corepack, and pnpm setup logic across all CI workflows.

This ensures consistent behavior across:
- Build validation
- Linting
- Type checking
- Testing (future)
- And any other workflow that needs repository dependencies

## What It Does

1. Sets up Node.js for the specified version
2. Enables Corepack
3. Installs the exact pnpm version declared in `packageManager`
4. Restores pnpm cache from `pnpm-lock.yaml`
5. Installs repository dependencies with `--frozen-lockfile`

## Usage

```yaml
steps:
  - uses: actions/checkout@v4

  - name: Setup repository
    uses: ./.github/actions/setup
    with:
      node-version: ${{ matrix.node }}

  - name: Your Task
    run: pnpm your-command
```

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| `node-version` | Yes | Node.js version (e.g., `22`, `23`, `24`) |

## Rationale

### Why a Composite Action?

This action reuses the same setup sequence across multiple workflows (build, lint, typecheck, and future workflows).

A composite action is the right choice here because:

- **Single source of truth** — Node/Corepack/pnpm setup logic lives in one place
- **Easy to update** — changes to setup automatically apply to all workflows
- **Workflow clarity** — workflows focus on their actual responsibility, not infrastructure boilerplate
- **Scope** — composite actions reuse steps within jobs; reusable workflows reuse entire jobs

### Separation of Concerns

- **Composite action** (this file) → Manage Node/pnpm infrastructure
- **Workflow files** → Orchestrate which tasks run and under what conditions
- **Repository scripts** (`package.json`) → Contain the actual implementation (build, lint, typecheck)

This layering keeps concerns separate as the CI system grows.
