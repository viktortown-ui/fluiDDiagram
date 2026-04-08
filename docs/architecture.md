# FluidDiagram Architecture

## Layered package model

1. **Domain (`packages/domain`)**
   - Contains shared contracts (`DiagramGraph`, `SimulationResult`, fluid profiles).
   - No dependency on UI frameworks, Electron, or filesystem.

2. **Equipment library (`packages/equipment-lib`)**
   - Canonical definitions of supported equipment kinds and default configuration.
   - Keeps component and solver code free from duplicated equipment constants.

3. **Editor engine (`packages/editor-engine`)**
   - Owns graph mutation and topology validation.
   - Depends only on domain contracts and equipment definitions.

4. **Simulation core (`packages/sim-core`)**
   - Executes deterministic hydraulic simulation against a domain graph.
   - Never imports renderer code.

5. **Runtime renderer (`packages/runtime-renderer`)**
   - Pure React view components that consume precomputed view models.
   - Does not mutate topology and does not execute simulation.

6. **File format + storage (`packages/file-format`, `packages/storage`)**
   - Versioned project schema and filesystem read/write services.

7. **Desktop host (`apps/desktop`)**
   - Electron main process and preload bridge.
   - Renderer bootstrap assembles editor + simulation outputs before handing data to UI components.

## Dependency direction

```text
shared/domain <- equipment-lib <- editor-engine
                 \             \-> sim-core
                  \-> file-format -> storage

runtime-renderer -> domain
apps/desktop (bootstrap) -> editor-engine + sim-core + file-format + storage + runtime-renderer
```

This prevents domain/simulation leakage into UI components and keeps solver/editor logic testable in isolation.
