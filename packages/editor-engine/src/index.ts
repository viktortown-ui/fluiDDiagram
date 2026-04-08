import type {
  DiagramEdge,
  DiagramGraph,
  DiagramNode,
  EdgeId,
  EquipmentInstanceId,
  EquipmentKind,
  NodeId,
  PortId
} from "@fluiddiagram/domain";
import { getEquipmentDefinition, instantiatePorts } from "@fluiddiagram/equipment-lib";

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
  kind: EquipmentKind,
  position: { x: number; y: number }
): DiagramNode {
  const definition = getEquipmentDefinition(kind);
  return {
    id,
    equipmentInstanceId: id as unknown as EquipmentInstanceId,
    equipmentTypeId: kind,
    kind,
    label: `${definition.displayName} ${id}`,
    config: structuredClone(definition.defaultConfig),
    placement: {
      position,
      orientationDeg: 0
    },
    ports: instantiatePorts(kind)
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
