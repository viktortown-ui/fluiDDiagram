# FluidDiagram Monorepo

Desktop-first engineering diagram and hydraulic simulation platform.

## Workspace layout

```text
.
├── apps/
│   └── desktop/               # Electron shell + Vite React renderer host
├── packages/
│   ├── domain/                # Core domain types and contracts
│   ├── sim-core/              # Simulation engine (no UI imports)
│   ├── editor-engine/         # Diagram editing and topology rules
│   ├── runtime-renderer/      # React runtime renderer composition
│   ├── equipment-lib/         # Equipment definitions and defaults
│   ├── file-format/           # Project schema + serialization/parsing
│   ├── storage/               # Filesystem persistence services
│   └── shared/                # Shared constants/utilities
├── branding/                  # Visual brand system assets
├── docs/                      # Architecture and technical docs
└── .github/workflows/         # CI pipelines
```

## Getting started

```bash
pnpm install
pnpm dev
```

- `pnpm dev` starts the Vite renderer and Electron desktop process.
- `pnpm typecheck` runs project references build checks.
- `pnpm lint` runs shared ESLint config.
- `pnpm format` runs shared Prettier config.

## Windows local launch scripts

For easier local review on Windows, the repository includes two batch files at the repo root.

- `run-dev.bat`
  - Starts the desktop app in development mode (`pnpm dev`).
- `update-and-run.bat`
  - Pulls the latest git changes.
  - Runs `pnpm install`.
  - Starts the desktop app in development mode (`pnpm dev`).

Use these scripts from a **locally cloned repository** (not from a downloaded ZIP without git history).

If helpful, you can create Windows desktop shortcuts to either script for one-click local startup.

## Architectural decisions

1. **Desktop-first shell**: Electron owns lifecycle, window management, and local workspace initialization.
2. **Strict package boundaries**:
   - UI code lives in `runtime-renderer` and `apps/desktop/src/renderer`.
   - Simulation logic lives in `sim-core` only.
   - Domain contracts live in `domain` and are imported by engines.
3. **Filesystem-native projects**: storage writes `*.fdproj/project.fd.json` for source control friendliness.
4. **Vite frontend toolchain**: renderer build/dev speed and HMR are handled by Vite.
5. **Monorepo references**: TypeScript project references enforce compile-time dependency direction.

## Production readiness notes

- CI validates typecheck, lint, and desktop build in GitHub Actions.
- Shared lint and formatting rules are centralized at repo root.
- This scaffold intentionally avoids demo-heavy UI and keeps the runtime minimal.
