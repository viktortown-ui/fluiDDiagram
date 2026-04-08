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
