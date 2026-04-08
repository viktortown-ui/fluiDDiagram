export type NodeId = string;
export type EdgeId = string;

export type EquipmentKind =
  | "Tank"
  | "CentrifugalPump"
  | "BallValve"
  | "Pipe";

export interface PortRef {
  nodeId: NodeId;
  port: string;
}

export interface DiagramNode<TConfig = unknown> {
  id: NodeId;
  kind: EquipmentKind;
  label: string;
  config: TConfig;
  position: {
    x: number;
    y: number;
  };
}

export interface DiagramEdge {
  id: EdgeId;
  from: PortRef;
  to: PortRef;
}

export interface DiagramGraph {
  nodes: Record<NodeId, DiagramNode>;
  edges: Record<EdgeId, DiagramEdge>;
}

export interface HydraulicNodeState {
  nodeId: NodeId;
  pressureKpa: number;
  flowInM3PerS: number;
  flowOutM3PerS: number;
}

export interface HydraulicEdgeState {
  edgeId: EdgeId;
  fromNodeId: NodeId;
  toNodeId: NodeId;
  flowM3PerS: number;
  direction: "from-to" | "to-from" | "stagnant";
  resistance: number;
}

export interface SimulationResult {
  nodeStates: Record<NodeId, HydraulicNodeState>;
  edgeStates: Record<EdgeId, HydraulicEdgeState>;
  warnings: string[];
}

export interface FluidProfile {
  id: string;
  displayName: string;
  densityKgPerM3: number;
  viscosityPaS: number;
}
