import { asPortId, type DiagramPort, type EquipmentKind, type PortDirection, type PortId, type PortRole } from "@fluiddiagram/domain";

export interface TankConfig {
  diameterM: number;
  heightM: number;
  liquidLevelM: number;
  basePressureKpa: number;
}

export interface CentrifugalPumpConfig {
  pressureBoostKpa: number;
  nominalFlowM3PerS: number;
  isEnabled: boolean;
}

export interface BallValveConfig {
  isOpen: boolean;
  openResistance: number;
  closedResistance: number;
}

export interface PipeConfig {
  lengthM: number;
  diameterM: number;
  roughnessMm: number;
}

export type EquipmentConfigByKind = {
  Tank: TankConfig;
  CentrifugalPump: CentrifugalPumpConfig;
  BallValve: BallValveConfig;
  Pipe: PipeConfig;
};

export interface PortTemplate {
  id: PortId;
  name: string;
  direction: PortDirection;
  role: PortRole;
}

export interface EquipmentDefinition<K extends EquipmentKind = EquipmentKind> {
  kind: K;
  displayName: string;
  defaultConfig: EquipmentConfigByKind[K];
  ports: PortTemplate[];
}

const definitions: { [K in EquipmentKind]: EquipmentDefinition<K> } = {
  Tank: {
    kind: "Tank",
    displayName: "Tank",
    ports: [
      { id: asPortId("outlet"), name: "Outlet", direction: "outlet", role: "process" },
      { id: asPortId("inlet"), name: "Inlet", direction: "inlet", role: "process" }
    ],
    defaultConfig: {
      diameterM: 2,
      heightM: 5,
      liquidLevelM: 3,
      basePressureKpa: 101.3
    }
  },
  CentrifugalPump: {
    kind: "CentrifugalPump",
    displayName: "Centrifugal Pump",
    ports: [
      { id: asPortId("suction"), name: "Suction", direction: "inlet", role: "process" },
      { id: asPortId("discharge"), name: "Discharge", direction: "outlet", role: "process" }
    ],
    defaultConfig: {
      pressureBoostKpa: 200,
      nominalFlowM3PerS: 0.04,
      isEnabled: true
    }
  },
  BallValve: {
    kind: "BallValve",
    displayName: "Ball Valve",
    ports: [
      { id: asPortId("inlet"), name: "Inlet", direction: "bidirectional", role: "process" },
      { id: asPortId("outlet"), name: "Outlet", direction: "bidirectional", role: "process" }
    ],
    defaultConfig: {
      isOpen: true,
      openResistance: 1,
      closedResistance: 1_000_000
    }
  },
  Pipe: {
    kind: "Pipe",
    displayName: "Pipe",
    ports: [
      { id: asPortId("a"), name: "End A", direction: "bidirectional", role: "process" },
      { id: asPortId("b"), name: "End B", direction: "bidirectional", role: "process" }
    ],
    defaultConfig: {
      lengthM: 10,
      diameterM: 0.1,
      roughnessMm: 0.045
    }
  }
};

export function getEquipmentDefinition<K extends EquipmentKind>(
  kind: K
): EquipmentDefinition<K> {
  const definition = definitions[kind];
  if (!definition) {
    throw new Error(`Unknown equipment kind: ${kind}`);
  }
  return definition;
}

export function listEquipmentDefinitions(): EquipmentDefinition[] {
  return Object.values(definitions);
}

export function instantiatePorts(kind: EquipmentKind): Record<PortId, DiagramPort> {
  const definition = getEquipmentDefinition(kind);
  return definition.ports.reduce<Record<PortId, DiagramPort>>((ports, port) => {
    ports[port.id] = {
      id: port.id,
      name: port.name,
      direction: port.direction,
      role: port.role
    };
    return ports;
  }, {} as Record<PortId, DiagramPort>);
}
