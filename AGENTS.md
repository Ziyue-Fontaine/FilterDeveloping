# AGENTS.md

This document provides essential development and verification guidelines for AI agents and contributors working in the VSeed/VBI monorepo.

## Project Overview

VBI (Visual Business Intelligence) is a lightweight, AI-oriented intelligent BI system. This is a pnpm-based monorepo containing:

- **@visactor/vseed**: Core visualization engine that transforms semantic configurations into VChart/VTable specs.
- **@visactor/vquery**: Lightweight query engine supporting DSL-to-SQL compilation and execution.
- **apps/website**: Documentation and Playground site.
- **practices/**: Example implementations and design patterns.

## Essential Commands

All commands **must** be executed from the project root using `pnpm`.

### 1. Environment & Build
- **Setup**: `pnpm install` (Ensures dependencies and husky hooks are installed)
- **Build All**: `pnpm run build` (Uses Turbo for workspace-aware building)
- **Start Website**: `pnpm run dev` (Launches `apps/website`)
- **Type Check**: `pnpm run typecheck`

### 2. Testing & Verification
Before submitting any changes, you **must** run the relevant verification commands to ensure stability.

#### Running All Tests
```bash
pnpm run test
```

#### Running Package-Specific Tests
- **VSeed (Vitest)**:
  ```bash
  pnpm --filter=@visactor/vseed run test:unit       # Isolated unit tests
  pnpm --filter=@visactor/vseed run test:integration # Full spec generation tests
  pnpm --filter=@visactor/vseed run test:coverage    # Check coverage reports
  ```
- **VQuery (Rstest)**:
  ```bash
  pnpm --filter=@visactor/vquery run test           # All query engine tests
  pnpm --filter=@visactor/vquery run test:update    # Update snapshots/specs
  ```

#### Running a Single Test
- **VSeed**: `pnpm --filter=@visactor/vseed vitest <filename_or_pattern>`
- **VQuery**: `pnpm --filter=@visactor/vquery rstest <filename_or_pattern>`
- **Example**: `pnpm --filter=@visactor/vseed vitest src/pipeline/utils/checkVSeed.test.ts`

- **Example**: `pnpm --filter=@visactor/vseed vitest src/pipeline/utils/checkVSeed.test.ts`

### 3. Generator Tool (The `g` Feature)
The repository includes a generator script `g` that synchronizes test cases and API documentation. **Run this after modifying core types, Zod schemas, or spec definitions.**
```bash
pnpm run g
```
This command performs:
1. `build:test`: Generates test cases from specs located in `tests/examples`.
2. `build:docs`: Updates API documentation based on JSDoc and TypeScript type definitions.
3. `build:api`: Synchronizes API schemas.
4. `format`: Re-formats the generated code using Prettier.

### 4. VBI Docker Environment
- **Start**: `pnpm run vbi:up`
- **Stop**: `pnpm run vbi:down`
- **Rebuild**: `pnpm run vbi:up --build`

## Code Style Guidelines

### 1. General Principles
- **Modern & Elegant**: Code should be readable, well-structured, and follow modern TypeScript patterns.
- **Strict Typing**: Prefer specific types over `any`. Use `zod` for runtime validation.

### 2. Formatting (Prettier)
The project uses the following Prettier configuration:
- **Semicolons**: Never (`"semi": false`)
- **Quotes**: Single (`"singleQuote": true`)
- **Trailing Commas**: Always (`"trailingComma": "all"`)
- **Print Width**: 120 characters
- **Indentation**: 2 spaces

### 3. Naming Conventions
- **Variables & Functions**: `camelCase` (e.g., `getChartData`, `updateSpec`).
- **Classes & Types**: `PascalCase` (e.g., `VSeedBuilder`, `DatasetReshapeInfo`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT`).
- **Zod Schemas**: Prefix with `z` (e.g., `zVSeed`, `zBarDimension`).
- **Files**: Use `camelCase` for source files (e.g., `dataSelector.ts`) and `zSchemaName.ts` for Zod schema files.

### 4. Imports & Exports
- **Consistent Type Imports**: Always use `import type` for types to optimize build sizes and avoid circular dependencies.
  ```typescript
  import type { VSeedSpec, ChartType } from './types'
  import { Builder } from './builder'
  ```
- **Barrel Exports**: Use `index.ts` files to expose public APIs for each directory.
- **No Side Effects**: Ensure code is tree-shakeable (`sideEffects: false` in `package.json`).

### 5. Error Handling
- **Descriptive Errors**: Use descriptive error messages that explain *why* an operation failed.
- **Fail Early**: Validate inputs at the beginning of functions.
- **Preferred Pattern**:
  ```typescript
  if (!chartType) {
    throw new Error('chartType is required in buildAdvanced')
  }
  ```
- **Boundary Handling**: Use `try...catch` blocks when dealing with dynamic execution (e.g., workers or user-provided scripts) or external API calls.

### 6. Documentation & Comments
- **JSDoc**: Use `@description`, `@param`, and `@returns` for public API methods.
- **Complexity**: Add comments for non-obvious logic, but avoid stating the obvious.
- **Code is Doc**: Prefer self-documenting code with clear variable and function names.
- **Consistency**: Keep all comments and documentation in English.

## Directory Structure & Conventions

- `packages/vseed/src/builder`: Logic for transforming semantic configs to VChart/VTable specs.
- `packages/vseed/src/pipeline`: Core data processing pipeline, including validation and transformation.
- `packages/vseed/src/types`: Centralized type definitions and Zod schemas.
- `packages/vquery/src`: DSL-to-SQL query engine logic.
- `apps/website/src`: Frontend implementation for the documentation and playground.
- `tests/unit`: Isolated logic tests for individual functions or classes.
- `tests/integrations`: Full-flow tests involving multiple components or full spec generation.

## Final Checklist Before PR
1. [ ] Code follows Prettier formatting (run `pnpm run format`).
2. [ ] ESLint passes (run `pnpm run lint`).
3. [ ] All relevant tests pass.
4. [ ] `pnpm run g` has been executed if types/specs were modified.
5. [ ] No `console.log` statements remain (unless strictly necessary for CLI tools).
