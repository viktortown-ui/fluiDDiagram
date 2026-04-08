import { createRoot } from "react-dom/client";
import React from "react";
import { addNode, createNode, createEmptyGraph, connect } from "@fluiddiagram/editor-engine";
import { runHydraulicSimulation } from "@fluiddiagram/simulation-core";

const seededGraph = connect(
  connect(
    addNode(
      addNode(
        addNode(
          createEmptyGraph(),
          createNode("tank-1", "Tank", { x: 100, y: 100 })
        ),
        createNode("pump-1", "CentrifugalPump", { x: 280, y: 100 })
      ),
      createNode("valve-1", "BallValve", { x: 460, y: 100 })
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

const simulation = runHydraulicSimulation(seededGraph);

function App(): React.JSX.Element {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>FluidDiagram</h1>
      <p>Desktop-first 2D engineering diagram system with modular simulation architecture.</p>
      <pre>{JSON.stringify(simulation, null, 2)}</pre>
    </main>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Missing root element");
}
createRoot(rootElement).render(<App />);
