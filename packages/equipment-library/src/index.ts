import type { EquipmentKind } from "@fluiddiagram/domain-model";

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

export interface EquipmentDefinition<K extends EquipmentKind = EquipmentKind> {
  kind: K;
  displayName: string;
  defaultConfig: EquipmentConfigByKind[K];
  ports: string[];
}

const definitions: { [K in EquipmentKind]: EquipmentDefinition<K> } = {
  Tank: {
    kind: "Tank",
    displayName: "Tank",
    ports: ["outlet", "inlet"],
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
    ports: ["suction", "discharge"],
    defaultConfig: {
      pressureBoostKpa: 200,
      nominalFlowM3PerS: 0.04,
      isEnabled: true
    }
  },
  BallValve: {
    kind: "BallValve",
    displayName: "Ball Valve",
    ports: ["inlet", "outlet"],
    defaultConfig: {
      isOpen: true,
      openResistance: 1,
      closedResistance: 1_000_000
    }
  },
  Pipe: {
    kind: "Pipe",
    displayName: "Pipe",
    ports: ["a", "b"],
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
  return definitions[kind];
}

export function listEquipmentDefinitions(): EquipmentDefinition[] {
  return Object.values(definitions);
}
