import { createEmptyProject, updateProjectGraph } from "@fluiddiagram/file-format";
import { addNode, connect, createEmptyGraph, createNode } from "@fluiddiagram/editor-engine";
import { runHydraulicSimulation } from "@fluiddiagram/sim-core";
import type { RuntimeRendererViewModel } from "@fluiddiagram/runtime-renderer";

function buildSeedGraph() {
  return connect(
    connect(
      addNode(
        addNode(addNode(createEmptyGraph(), createNode("tank-1", "Tank", { x: 80, y: 80 })), createNode("pump-1", "CentrifugalPump", { x: 260, y: 80 })),
        createNode("valve-1", "BallValve", { x: 440, y: 80 })
      ),
      "edge-1",
      "tank-1",
      "outlet",
      "pump-1",
      "suction"
    ),
    "edge-2",
    "pump-1",
    "discharge",
    "valve-1",
    "inlet"
  );
}

export function createRendererModel(): RuntimeRendererViewModel {
  const graph = buildSeedGraph();
  const project = updateProjectGraph(createEmptyProject("FluidDiagram"), graph);

  return {
    projectName: project.metadata.projectName,
    graph,
    simulation: runHydraulicSimulation(graph)
  };
}
