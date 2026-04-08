import type {
  DiagramGraph,
  DiagramNode,
  HydraulicEdgeState,
  HydraulicNodeState,
  SimulationResult
} from "@fluiddiagram/domain-model";
import type {
  BallValveConfig,
  CentrifugalPumpConfig,
  PipeConfig,
  TankConfig
} from "@fluiddiagram/equipment-library";

const MIN_RESISTANCE = 0.0001;

/**
 * NOTE: This is a deliberately simplified steady-state propagation model.
 * It does not attempt full Navier-Stokes or transient hydraulic behavior.
 * The model is kept explicit and replaceable for future solver upgrades.
 */
export function runHydraulicSimulation(graph: DiagramGraph): SimulationResult {
  const warnings: string[] = [];

  const nodeStates: Record<string, HydraulicNodeState> = {};
  for (const node of Object.values(graph.nodes)) {
    nodeStates[node.id] = {
      nodeId: node.id,
      pressureKpa: deriveBasePressure(node),
      flowInM3PerS: 0,
      flowOutM3PerS: 0
    };
  }

  const edgeStates: Record<string, HydraulicEdgeState> = {};
  for (const edge of Object.values(graph.edges)) {
    const fromState = nodeStates[edge.from.nodeId];
    const toState = nodeStates[edge.to.nodeId];

    if (!fromState || !toState) {
      warnings.push(`Edge ${edge.id} references missing nodes and was skipped.`);
      continue;
    }

    const fromNode = graph.nodes[edge.from.nodeId];
    const toNode = graph.nodes[edge.to.nodeId];
    if (!fromNode || !toNode) {
      warnings.push(`Edge ${edge.id} could not resolve endpoint equipment.`);
      continue;
    }

    const resistance = deriveConnectionResistance(fromNode, toNode);

    const deltaP = fromState.pressureKpa - toState.pressureKpa;
    const flow = resistance <= MIN_RESISTANCE ? 0 : deltaP / resistance;

    if (flow > 0) {
      fromState.flowOutM3PerS += flow;
      toState.flowInM3PerS += flow;
    } else if (flow < 0) {
      fromState.flowInM3PerS += Math.abs(flow);
      toState.flowOutM3PerS += Math.abs(flow);
    }

    edgeStates[edge.id] = {
      edgeId: edge.id,
      fromNodeId: edge.from.nodeId,
      toNodeId: edge.to.nodeId,
      flowM3PerS: Math.abs(flow),
      direction: flow > 0 ? "from-to" : flow < 0 ? "to-from" : "stagnant",
      resistance
    };
  }

  propagatePressures(nodeStates, edgeStates);

  return {
    nodeStates,
    edgeStates,
    warnings
  };
}

function deriveBasePressure(node: DiagramNode): number {
  switch (node.kind) {
    case "Tank": {
      const cfg = node.config as TankConfig;
      const levelRatio = cfg.heightM > 0 ? cfg.liquidLevelM / cfg.heightM : 0;
      return cfg.basePressureKpa + 50 * Math.max(0, Math.min(1, levelRatio));
    }
    case "CentrifugalPump": {
      const cfg = node.config as CentrifugalPumpConfig;
      return cfg.isEnabled ? 101.3 + cfg.pressureBoostKpa : 101.3;
    }
    default:
      return 101.3;
  }
}

function deriveConnectionResistance(a: DiagramNode, b: DiagramNode): number {
  const nodeResistance = [a, b]
    .map((node) => {
      switch (node.kind) {
        case "BallValve": {
          const cfg = node.config as BallValveConfig;
          return cfg.isOpen ? cfg.openResistance : cfg.closedResistance;
        }
        case "Pipe": {
          const cfg = node.config as PipeConfig;
          return Math.max(MIN_RESISTANCE, cfg.lengthM / Math.max(0.001, cfg.diameterM));
        }
        default:
          return 1;
      }
    })
    .reduce((sum, value) => sum + value, 0);

  return Math.max(MIN_RESISTANCE, nodeResistance);
}

function propagatePressures(
  nodeStates: Record<string, HydraulicNodeState>,
  edgeStates: Record<string, HydraulicEdgeState>
): void {
  for (const edge of Object.values(edgeStates)) {
    if (edge.direction === "stagnant") {
      continue;
    }

    const source =
      edge.direction === "from-to"
        ? nodeStates[edge.fromNodeId]
        : nodeStates[edge.toNodeId];

    const target =
      edge.direction === "from-to"
        ? nodeStates[edge.toNodeId]
        : nodeStates[edge.fromNodeId];

    if (!source || !target) {
      continue;
    }

    // Simplified pressure transfer with damping to avoid immediate equalization.
    target.pressureKpa += (source.pressureKpa - target.pressureKpa) * 0.3;
  }
}
