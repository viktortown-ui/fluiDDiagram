export type Brand<T, B extends string> = T & { readonly __brand: B };

export type ProjectId = Brand<string, "ProjectId">;
export type DiagramId = Brand<string, "DiagramId">;

export type NodeId = Brand<string, "NodeId">;
export type PortId = Brand<string, "PortId">;
export type EdgeId = Brand<string, "EdgeId">;

export type EquipmentInstanceId = Brand<string, "EquipmentInstanceId">;
export type EquipmentTypeId = BuiltinEquipmentTypeId | (string & {});

export const BUILTIN_EQUIPMENT_TYPE_IDS = [
  "Tank",
  "CentrifugalPump",
  "BallValve",
  "Pipe"
] as const;

export type BuiltinEquipmentTypeId = (typeof BUILTIN_EQUIPMENT_TYPE_IDS)[number];

/**
 * Legacy alias retained for existing package compatibility.
 * Prefer EquipmentTypeId for new domain code.
 */
export type EquipmentKind = BuiltinEquipmentTypeId;

export const asProjectId = (value: string): ProjectId => value as ProjectId;
export const asDiagramId = (value: string): DiagramId => value as DiagramId;
export const asNodeId = (value: string): NodeId => value as NodeId;
export const asPortId = (value: string): PortId => value as PortId;
export const asEdgeId = (value: string): EdgeId => value as EdgeId;
export const asEquipmentInstanceId = (value: string): EquipmentInstanceId => value as EquipmentInstanceId;

export interface DomainMetadata {
  tags?: string[];
  notes?: string;
  custom?: Record<string, unknown>;
}

export interface DiagramProjectRef {
  projectId: ProjectId;
  diagramId: DiagramId;
}

export interface DiagramProject {
  ref: DiagramProjectRef;
  metadata: DomainMetadata;
  graph: DiagramGraph;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface NodePlacement2D {
  position: Point2D;
  orientationDeg?: number;
}

export type PortDirection = "inlet" | "outlet" | "bidirectional" | "unknown";
export type PortRole = "process" | "service" | "measurement" | "drain" | (string & {});

export interface PortCompatibility {
  mediumFamilies?: string[];
  nominalDiameterMm?: number;
  pressureClass?: string;
}

export interface DiagramPort {
  id: PortId;
  name: string;
  direction: PortDirection;
  role: PortRole;
  compatibility?: PortCompatibility;
  metadata?: DomainMetadata;
}

export interface PortRef {
  nodeId: NodeId;
  portId: PortId;
}

export interface DiagramNode<TConfig = unknown> {
  id: NodeId;
  equipmentInstanceId: EquipmentInstanceId;
  equipmentTypeId: EquipmentTypeId;
  /**
   * Legacy mirror for existing packages. Keep aligned with equipmentTypeId
   * while built-in equipment is still the only implemented set.
   */
  kind: EquipmentKind;
  label: string;
  config: TConfig;
  placement: NodePlacement2D;
  ports: Record<PortId, DiagramPort>;
  metadata?: DomainMetadata;
}

export interface DiagramEdge {
  id: EdgeId;
  from: PortRef;
  to: PortRef;
  metadata?: DomainMetadata;
}

export interface DiagramGraph {
  nodes: Record<NodeId, DiagramNode>;
  edges: Record<EdgeId, DiagramEdge>;
  metadata?: DomainMetadata;
}

export interface UnitValue {
  value: number;
  unit: string;
}

export interface FluidProfile {
  id: string;
  displayName: string;
  density: UnitValue;
  dynamicViscosity: UnitValue;
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
