# FluidDiagram Architecture

## Boundaries

- **Domain (`packages/domain`)**: graph and simulation contracts only.
- **Simulation (`packages/sim-core`)**: deterministic solver logic with no UI imports.
- **Editor (`packages/editor-engine`)**: graph mutation and validation.
- **Runtime renderer (`packages/runtime-renderer`)**: React composition of domain + editor + simulation outputs.
- **Storage (`packages/storage`, `packages/file-format`)**: project persistence, serialization, and validation.
- **Desktop shell (`apps/desktop`)**: Electron process orchestration and renderer host.

## Why this shape

This keeps simulation and domain testable in isolation and prevents renderer components from accumulating domain mutation logic.

## Storage foundation (v1)

### App-level storage (Electron `app.getPath`)

- `userData/config`: user preferences and app config.
- `userData/logs`: application/service logs.
- `userData/cache`: disposable cache data.
- `userData/db`: service-level SQLite and relational app metadata.
- `userData/projects`: default root for local project folders.
- `userData/autosave-metadata`: app-level metadata index for recovery UX.
- `temp/FluidDiagram`: temporary artifacts and transient files.

### Project-level storage (`.fdproj` directory)

Each project is a portable folder ending in `.fdproj`:

```text
example.fdproj/
├── project.fd.json      # authoritative project source-of-truth
├── assets/              # images, references, imported documents
├── libraries/           # project-local equipment/library definitions
├── snapshots/           # autosave snapshots (`snapshot-*.fd.json`)
├── results/             # simulation outputs and export artifacts
└── metadata/            # non-authoritative supporting metadata
```

`project.fd.json` is always authoritative. Any SQLite usage remains app/service-level and must not become hidden project truth.
