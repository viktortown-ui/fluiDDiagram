import React from "react";
import { addNode, connect, createEmptyGraph, createNode } from "@fluiddiagram/editor-engine";
import { runHydraulicSimulation } from "@fluiddiagram/sim-core";

function seedGraph() {
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

export function App(): React.JSX.Element {
  const simulation = runHydraulicSimulation(seedGraph());

  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>FluidDiagram Desktop</h1>
      <p>Renderer is isolated from domain and simulation implementation details.</p>
      <pre>{JSON.stringify(simulation, null, 2)}</pre>
    </main>
  );
}
