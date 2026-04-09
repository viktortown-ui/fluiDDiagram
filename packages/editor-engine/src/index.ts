import type {
  BuiltinEquipmentTypeId,
  DiagramEdge,
  DiagramGraph,
  DiagramNode,
  EdgeId,
  EquipmentInstanceId,
  EquipmentTypeId,
  NodeId,
  PortId
} from "@fluiddiagram/domain";
import { BUILTIN_EQUIPMENT_TYPE_IDS } from "@fluiddiagram/domain";
import {
  getEquipmentDefinition,
  instantiateEquipmentDefaults,
  instantiatePorts
} from "@fluiddiagram/equipment-lib";

export function createEmptyGraph(): DiagramGraph {
  return { nodes: {}, edges: {} };
}

export function addNode(
  graph: DiagramGraph,
  node: DiagramNode
): DiagramGraph {
  if (graph.nodes[node.id]) {
    throw new Error(`Node with id ${node.id} already exists.`);
  }

  return {
    ...graph,
    nodes: {
      ...graph.nodes,
      [node.id]: node
    }
  };
}

export function createNode(
  id: NodeId,
  equipmentTypeId: EquipmentTypeId,
  position: { x: number; y: number }
): DiagramNode {
  const definition = getEquipmentDefinition(equipmentTypeId);
  if (
    !BUILTIN_EQUIPMENT_TYPE_IDS.includes(
      equipmentTypeId as (typeof BUILTIN_EQUIPMENT_TYPE_IDS)[number]
    )
  ) {
    throw new Error(
      `Unsupported equipmentTypeId for DiagramNode.kind legacy field: ${equipmentTypeId}`
    );
  }
  const builtinEquipmentTypeId = equipmentTypeId as BuiltinEquipmentTypeId;

  return {
    id,
    equipmentInstanceId: id as unknown as EquipmentInstanceId,
    equipmentTypeId,
    kind: builtinEquipmentTypeId,
    label: `${definition.displayName} ${id}`,
    config: instantiateEquipmentDefaults(equipmentTypeId),
    placement: {
      position,
      orientationDeg: 0
    },
    ports: instantiatePorts(equipmentTypeId)
  };
}

export function connect(
  graph: DiagramGraph,
  edgeId: EdgeId,
  fromNodeId: NodeId,
  fromPortId: PortId,
  toNodeId: NodeId,
  toPortId: PortId
): DiagramGraph {
  const fromNode = graph.nodes[fromNodeId];
  const toNode = graph.nodes[toNodeId];
  if (!fromNode || !toNode) {
    throw new Error("Cannot connect edge: missing source or target node.");
  }

  assertValidPort(fromNode, fromPortId);
  assertValidPort(toNode, toPortId);

  const edge: DiagramEdge = {
    id: edgeId,
    from: { nodeId: fromNodeId, portId: fromPortId },
    to: { nodeId: toNodeId, portId: toPortId }
  };

  return {
    ...graph,
    edges: {
      ...graph.edges,
      [edge.id]: edge
    }
  };
}

function assertValidPort(node: DiagramNode, portId: PortId): void {
  if (!node.ports[portId]) {
    throw new Error(`Port ${portId} is not valid for equipment kind ${node.kind}.`);
  }
}
