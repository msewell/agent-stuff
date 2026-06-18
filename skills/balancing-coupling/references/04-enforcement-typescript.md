# TypeScript/JavaScript Enforcement

## Table of Contents

- [Enforcement strategy](#enforcement-strategy)
- [dependency-cruiser](#dependency-cruiser)
- [ESLint boundary checks](#eslint-boundary-checks)
- [Nx monorepos](#nx-monorepos)
- [Circular dependency checks](#circular-dependency-checks)
- [CI ratchets](#ci-ratchets)

Automate boundary rules. Architectural conventions that rely only on discipline usually erode.

When applying enforcement to a repo, modify only existing project/config surfaces unless the user explicitly asks for scaffolding. If `src/`, `package.json`, `tsconfig.json`, or CI directories are absent, stop and ask before creating them. Do not create placeholder source modules or documentation just to make examples validate.

## Enforcement strategy

1. Start with rules that prevent the worst new violations.
2. Run checks in CI on every pull request.
3. If legacy violations exist, baseline them and fail only when the count increases.
4. Ratchet warnings to errors as debt is removed.
5. Keep rules close to the architecture language used by the team.
6. Before writing files, confirm the repo has the referenced directories and package manager. If it does not, return config snippets and ask whether to create the missing project files.

## dependency-cruiser

Use `dependency-cruiser` for dependency graph rules and visualization.

```bash
npx depcruise --init
```

Example `.dependency-cruiser.js`:

```javascript
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Cycles create unpredictable initialization order and make modules hard to isolate.",
      from: {},
      to: { circular: true },
    },
    {
      name: "core-not-to-infrastructure",
      severity: "error",
      comment: "Core business code may depend on contracts, not concrete I/O, framework, or vendor code.",
      from: { path: "^src/(core|domain|application)" },
      to: { path: "^src/(infrastructure|integrations|framework|ui)" },
    },
    {
      name: "no-feature-internals",
      severity: "error",
      comment: "Feature modules must not import another feature's internals. Use the feature's published contract.",
      from: { path: "^src/features/([^/]+)/.+" },
      to: {
        path: "^src/features/([^/]+)/.+",
        pathNot: [
          "^src/features/$1/.+",
          "^src/features/[^/]+/index\\.ts$",
          "^src/features/[^/]+/public\\.ts$",
        ],
      },
    },
    {
      name: "no-orphans",
      severity: "warn",
      from: { orphan: true, pathNot: ["\\.d\\.ts$", "(^|/)index\\.ts$"] },
      to: {},
    },
  ],
  options: {
    tsConfig: { fileName: "tsconfig.json" },
    doNotFollow: { path: "node_modules" },
  },
};
```

Install after confirming the package manager and getting approval to add dev dependencies:

```bash
npm install -D dependency-cruiser madge
```

Package scripts to add after confirming the project uses npm scripts or adapting to its package manager:

```json
{
  "scripts": {
    "lint:arch": "depcruise src --config .dependency-cruiser.js",
    "graph:deps": "depcruise src --include-only ^src --output-type dot | dot -T svg > docs/deps.svg"
  }
}
```

## ESLint boundary checks

Use built-in `no-restricted-imports` for simple path rules.

```javascript
// eslint.config.js
export default [
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/data/**", "**/db/**"],
              message: "UI must not import data access directly. Go through the application boundary.",
            },
          ],
        },
      ],
    },
  },
];
```

Use `eslint-plugin-boundaries` when folders have explicit architectural roles. Verify resolver behavior in pnpm workspaces; if package dependencies are undeclared, checks may silently miss imports.

## Nx monorepos

Use `@nx/enforce-module-boundaries` with tags.

```json
{
  "@nx/enforce-module-boundaries": [
    "error",
    {
      "depConstraints": [
        { "sourceTag": "scope:client", "onlyDependOnLibsWithTags": ["scope:client", "scope:shared"] },
        { "sourceTag": "scope:admin", "onlyDependOnLibsWithTags": ["scope:admin", "scope:shared"] },
        { "sourceTag": "type:feature", "onlyDependOnLibsWithTags": ["type:feature", "type:util", "type:data"] },
        { "sourceTag": "type:util", "onlyDependOnLibsWithTags": ["type:util"] }
      ]
    }
  ]
}
```

## Circular dependency checks

TypeScript can compile circular imports that fail at runtime. Add a dedicated cycle check.

```json
{
  "scripts": {
    "lint:cycles": "madge --circular --extensions ts,tsx --ts-config tsconfig.json src"
  }
}
```

Common fixes, in order:

1. Pull shared types/constants into a third module both sides import.
2. Use `import type` for type-only references.
3. Inject dependencies instead of constructing peer services directly.
4. Stop importing a folder barrel from inside the same folder it re-exports.

## CI ratchets

Track trends rather than demanding instant perfection in legacy systems:

- cycle count must not increase;
- fan-in hubs require review before growing;
- fan-out from core modules must not increase without justification;
- new cross-feature imports must go through published contracts;
- warnings should have owners and a planned date to become errors.

Use hard failures for new violations once the architecture boundary is agreed. A warning-only rule is documentation, not enforcement.
