import React from "react";
import { addNode, connect, createEmptyGraph, createNode } from "@fluiddiagram/editor-engine";
import { asEdgeId, asNodeId, asPortId } from "@fluiddiagram/domain";
import { runHydraulicSimulation } from "@fluiddiagram/sim-core";

function seedGraph() {
  return connect(
    connect(
      addNode(
        addNode(
          addNode(createEmptyGraph(), createNode(asNodeId("tank-1"), "Tank", { x: 80, y: 80 })),
          createNode(asNodeId("pump-1"), "CentrifugalPump", { x: 260, y: 80 })
        ),
        createNode(asNodeId("valve-1"), "BallValve", { x: 440, y: 80 })
      ),
      asEdgeId("edge-1"),
      asNodeId("tank-1"),
      asPortId("outlet"),
      asNodeId("pump-1"),
      asPortId("suction")
    ),
    asEdgeId("edge-2"),
    asNodeId("pump-1"),
    asPortId("discharge"),
    asNodeId("valve-1"),
    asPortId("inlet")
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
