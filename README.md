# FluidDiagram Monorepo

FluidDiagram is organized as a desktop-first TypeScript monorepo with strict package boundaries between domain, simulation, editor logic, rendering, and persistence.

## Directory structure

```text
.
├── apps/
│   └── desktop/                    # Electron shell + Vite React renderer host
├── packages/
│   ├── domain/                     # Core domain contracts and types
│   ├── sim-core/                   # Deterministic hydraulic simulation engine
│   ├── editor-engine/              # Graph editing and connection validation
│   ├── runtime-renderer/           # React UI components (no simulation logic)
│   ├── equipment-lib/              # Equipment definitions + default configs
│   ├── file-format/                # Project schema, serialization, parsing
│   ├── storage/                    # Filesystem persistence services
│   └── shared/                     # Cross-cutting constants and utility primitives
├── branding/                       # Logos, color system, typography guidance
├── docs/                           # Architecture and engineering docs
└── .github/workflows/              # CI automation
```

## Workspace purpose

- `apps/desktop`: production desktop host process and renderer entrypoint.
- `packages/domain`: reusable source of truth for model and simulation result contracts.
- `packages/sim-core`: solver logic isolated from UI and rendering.
- `packages/editor-engine`: deterministic graph manipulation APIs.
- `packages/runtime-renderer`: view layer that renders precomputed models.
- `packages/equipment-lib`: available equipment kinds + default parameter values.
- `packages/file-format` + `packages/storage`: versioned file contracts and local persistence.
- `packages/shared`: shared constants across storage and host layers.

## Getting started

```bash
pnpm install
pnpm dev
```

### Common commands

- `pnpm dev` — launches Vite renderer + Electron host.
- `pnpm typecheck` — runs TypeScript workspace validation.
- `pnpm lint` — runs shared ESLint config.
- `pnpm format` — runs shared Prettier config.
- `pnpm build` — compiles project references and builds desktop renderer.

## Shared toolchain

- TypeScript base config in `tsconfig.base.json`.
- Workspace typecheck config in `tsconfig.json` and `tsconfig.build.json`.
- Flat ESLint config in `eslint.config.mjs`.
- Prettier config in `.prettierrc.json`.

## Architecture decisions

1. **Desktop-first runtime**: Electron owns lifecycle and local filesystem workspace initialization.
2. **Strict boundary enforcement**: simulation and editor packages are consumed by non-UI bootstrap code, while React components only render prepared view models.
3. **Schema-first persistence**: project files are validated by `zod` in `file-format` before storage reads/writes.
4. **Monorepo scalability**: each package is independently referencable and buildable via TypeScript project references.
5. **GitHub-ready CI**: workflow validates install, typecheck, lint, and desktop build.
