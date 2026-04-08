# FluidDiagram

FluidDiagram is a desktop-first 2D engineering diagram and hydraulic simulation platform.

## Architecture

This repository is a modular monorepo with strict boundaries:

- `apps/desktop`: Electron desktop shell and React renderer entry points.
- `packages/domain-model`: shared engineering graph and simulation domain types.
- `packages/editor-engine`: graph editing operations with equipment/port validation.
- `packages/equipment-library`: initial equipment definitions (Tank, CentrifugalPump, BallValve, Pipe).
- `packages/simulation-core`: simplified but explicit hydraulic solver core.
- `packages/storage-format`: project schema and `.fdproj` / `project.fd.json` storage rules.

## Current simulation scope

The current solver intentionally implements simplified steady-state behavior:

- connectivity processing through graph edges
- flow direction from pressure differences
- pressure propagation with explicit damping
- pump pressure boost
- valve open/close resistance effects
- tank pressure baseline from level ratio

The simplifications are explicitly documented in code so the solver can be replaced with more advanced models later.

## Storage model

- Project folders are stored as `<project-id>.fdproj`
- Main project file is `project.fd.json`
- Autosaves are stored under `<project>.fdproj/autosave/*.snapshot.fd.json`
- SQLite is reserved for app/service metadata only (not project engineering data)
