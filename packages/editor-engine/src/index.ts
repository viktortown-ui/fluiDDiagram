import type {
  DiagramEdge,
  DiagramGraph,
  DiagramNode,
  EdgeId,
  EquipmentKind,
  NodeId
} from "@fluiddiagram/domain";
import { getEquipmentDefinition } from "@fluiddiagram/equipment-lib";

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
    kind,
    label: `${definition.displayName} ${id}`,
    config: structuredClone(definition.defaultConfig),
    position
  };
}

export function connect(
  graph: DiagramGraph,
  edgeId: EdgeId,
  fromNodeId: NodeId,
  fromPort: string,
  toNodeId: NodeId,
  toPort: string
): DiagramGraph {
  const fromNode = graph.nodes[fromNodeId];
  const toNode = graph.nodes[toNodeId];
  if (!fromNode || !toNode) {
    throw new Error("Cannot connect edge: missing source or target node.");
  }

  assertValidPort(fromNode.kind, fromPort);
  assertValidPort(toNode.kind, toPort);

  const edge: DiagramEdge = {
    id: edgeId,
    from: { nodeId: fromNodeId, port: fromPort },
    to: { nodeId: toNodeId, port: toPort }
  };

  return {
    ...graph,
    edges: {
      ...graph.edges,
      [edge.id]: edge
    }
  };
}

function assertValidPort(kind: EquipmentKind, port: string): void {
  const definition = getEquipmentDefinition(kind);
  if (!definition.ports.includes(port)) {
    throw new Error(`Port ${port} is not valid for equipment kind ${kind}.`);
  }
}
