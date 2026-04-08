import React from "react";
import type { DiagramGraph, SimulationResult } from "@fluiddiagram/domain";

export interface RuntimeRendererViewModel {
  projectName: string;
  graph: DiagramGraph;
  simulation: SimulationResult;
}

export interface AppProps {
  model: RuntimeRendererViewModel;
}

export function App({ model }: AppProps): React.JSX.Element {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>{model.projectName}</h1>
      <p>Desktop renderer host is active.</p>
      <section>
        <h2>Graph</h2>
        <p>
          Nodes: {Object.keys(model.graph.nodes).length} · Edges: {Object.keys(model.graph.edges).length}
        </p>
      </section>
      <section>
        <h2>Simulation Snapshot</h2>
        <pre>{JSON.stringify(model.simulation, null, 2)}</pre>
      </section>
    </main>
  );
}
