import {
  asPortId,
  type BuiltinEquipmentTypeId,
  type DiagramPort,
  type EquipmentTypeId,
  type PortCompatibility,
  type PortDirection,
  type PortId,
  type PortRole
} from "@fluiddiagram/domain";

export type EquipmentCategory =
  | "storage"
  | "rotodynamic"
  | "valve"
  | "conduit"
  | (string & {});

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

export interface TankSimulationDefaults {
  minOperationalLevelM: number;
}

export interface CentrifugalPumpSimulationDefaults {
  maxHeadKpa: number;
  efficiency: number;
}

export interface BallValveSimulationDefaults {
  leakageFactor: number;
}

export interface PipeSimulationDefaults {
  minorLossCoefficient: number;
}

export type BuiltinEquipmentConfigByTypeId = {
  Tank: TankConfig;
  CentrifugalPump: CentrifugalPumpConfig;
  BallValve: BallValveConfig;
  Pipe: PipeConfig;
};

export type BuiltinSimulationDefaultsByTypeId = {
  Tank: TankSimulationDefaults;
  CentrifugalPump: CentrifugalPumpSimulationDefaults;
  BallValve: BallValveSimulationDefaults;
  Pipe: PipeSimulationDefaults;
};

/**
 * Legacy alias retained for existing package compatibility.
 * Prefer BuiltinEquipmentConfigByTypeId for new code.
 */
export type EquipmentConfigByKind = BuiltinEquipmentConfigByTypeId;

export interface EquipmentPortTemplate {
  id: string;
  name: string;
  direction: PortDirection;
  role: PortRole;
  compatibility?: PortCompatibility;
}

export interface EquipmentEditorHints {
  icon?: string;
  defaultSize?: {
    width: number;
    height: number;
  };
  color?: string;
}

export interface SimulationParameterShape<TSimParameters = unknown> {
  schemaVersion: number;
  defaultParameters: TSimParameters;
}

export interface EquipmentDefinition<TConfig = unknown, TSimParameters = unknown> {
  typeId: EquipmentTypeId;
  displayName: string;
  category: EquipmentCategory;
  portTemplates: readonly EquipmentPortTemplate[];
  defaultConfig: TConfig;
  editorHints?: EquipmentEditorHints;
  simulation?: SimulationParameterShape<TSimParameters>;
}

export interface EquipmentRegistry {
  register<TConfig, TSimParameters>(
    definition: EquipmentDefinition<TConfig, TSimParameters>
  ): void;
  resolve(typeId: EquipmentTypeId): EquipmentDefinition | undefined;
  require(typeId: EquipmentTypeId): EquipmentDefinition;
  list(): EquipmentDefinition[];
  instantiateDefaults<TConfig = unknown>(typeId: EquipmentTypeId): TConfig;
  materializePorts(typeId: EquipmentTypeId): Record<PortId, DiagramPort>;
}

class InMemoryEquipmentRegistry implements EquipmentRegistry {
  private readonly definitions = new Map<EquipmentTypeId, EquipmentDefinition>();

  register<TConfig, TSimParameters>(
    definition: EquipmentDefinition<TConfig, TSimParameters>
  ): void {
    assertValidEquipmentDefinition(definition);
    if (this.definitions.has(definition.typeId)) {
      throw new Error(`Equipment definition already registered: ${definition.typeId}`);
    }

    this.definitions.set(definition.typeId, definition);
  }

  resolve(typeId: EquipmentTypeId): EquipmentDefinition | undefined {
    return this.definitions.get(typeId);
  }

  require(typeId: EquipmentTypeId): EquipmentDefinition {
    const definition = this.resolve(typeId);
    if (!definition) {
      throw new Error(`Unknown equipment type id: ${typeId}`);
    }

    return definition;
  }

  list(): EquipmentDefinition[] {
    return [...this.definitions.values()];
  }

  instantiateDefaults<TConfig = unknown>(typeId: EquipmentTypeId): TConfig {
    const definition = this.require(typeId);
    return structuredClone(definition.defaultConfig) as TConfig;
  }

  materializePorts(typeId: EquipmentTypeId): Record<PortId, DiagramPort> {
    const definition = this.require(typeId);

    return definition.portTemplates.reduce<Record<PortId, DiagramPort>>((ports, template) => {
      const portId = asPortId(template.id);
      ports[portId] = {
        id: portId,
        name: template.name,
        direction: template.direction,
        role: template.role,
        compatibility: template.compatibility
      };
      return ports;
    }, {} as Record<PortId, DiagramPort>);
  }
}

function assertValidEquipmentDefinition(definition: EquipmentDefinition): void {
  if (!definition.typeId) {
    throw new Error("Equipment definition typeId is required.");
  }

  if (definition.portTemplates.length === 0) {
    throw new Error(`Equipment ${definition.typeId} must define at least one port template.`);
  }

  const portTemplateIds = new Set<string>();
  for (const portTemplate of definition.portTemplates) {
    if (portTemplateIds.has(portTemplate.id)) {
      throw new Error(
        `Equipment ${definition.typeId} contains duplicate port template id ${portTemplate.id}.`
      );
    }

    portTemplateIds.add(portTemplate.id);
  }
}

const BUILTIN_EQUIPMENT_DEFINITIONS: Record<
  BuiltinEquipmentTypeId,
  EquipmentDefinition
> = {
  Tank: {
    typeId: "Tank",
    displayName: "Tank",
    category: "storage",
    portTemplates: [
      { id: "inlet", name: "Inlet", direction: "inlet", role: "process" },
      { id: "outlet", name: "Outlet", direction: "outlet", role: "process" }
    ],
    defaultConfig: {
      diameterM: 2,
      heightM: 5,
      liquidLevelM: 3,
      basePressureKpa: 101.3
    },
    editorHints: {
      icon: "tank",
      defaultSize: { width: 120, height: 160 },
      color: "#4c7ef3"
    },
    simulation: {
      schemaVersion: 1,
      defaultParameters: {
        minOperationalLevelM: 0.2
      }
    }
  },
  CentrifugalPump: {
    typeId: "CentrifugalPump",
    displayName: "Centrifugal Pump",
    category: "rotodynamic",
    portTemplates: [
      { id: "suction", name: "Suction", direction: "inlet", role: "process" },
      { id: "discharge", name: "Discharge", direction: "outlet", role: "process" }
    ],
    defaultConfig: {
      pressureBoostKpa: 200,
      nominalFlowM3PerS: 0.04,
      isEnabled: true
    },
    editorHints: {
      icon: "pump",
      defaultSize: { width: 120, height: 100 },
      color: "#2f9e44"
    },
    simulation: {
      schemaVersion: 1,
      defaultParameters: {
        maxHeadKpa: 280,
        efficiency: 0.78
      }
    }
  },
  BallValve: {
    typeId: "BallValve",
    displayName: "Ball Valve",
    category: "valve",
    portTemplates: [
      { id: "inlet", name: "Inlet", direction: "bidirectional", role: "process" },
      { id: "outlet", name: "Outlet", direction: "bidirectional", role: "process" }
    ],
    defaultConfig: {
      isOpen: true,
      openResistance: 1,
      closedResistance: 1_000_000
    },
    editorHints: {
      icon: "valve-ball",
      defaultSize: { width: 100, height: 70 },
      color: "#f08c00"
    },
    simulation: {
      schemaVersion: 1,
      defaultParameters: {
        leakageFactor: 0.0001
      }
    }
  },
  Pipe: {
    typeId: "Pipe",
    displayName: "Pipe",
    category: "conduit",
    portTemplates: [
      { id: "a", name: "End A", direction: "bidirectional", role: "process" },
      { id: "b", name: "End B", direction: "bidirectional", role: "process" }
    ],
    defaultConfig: {
      lengthM: 10,
      diameterM: 0.1,
      roughnessMm: 0.045
    },
    editorHints: {
      icon: "pipe",
      defaultSize: { width: 160, height: 50 },
      color: "#868e96"
    },
    simulation: {
      schemaVersion: 1,
      defaultParameters: {
        minorLossCoefficient: 0
      }
    }
  }
};

export function createEquipmentRegistry(
  initialDefinitions: EquipmentDefinition[] = []
): EquipmentRegistry {
  const registry = new InMemoryEquipmentRegistry();
  for (const definition of initialDefinitions) {
    registry.register(definition);
  }
  return registry;
}

export const defaultEquipmentRegistry = createEquipmentRegistry();
for (const definition of Object.values(BUILTIN_EQUIPMENT_DEFINITIONS)) {
  defaultEquipmentRegistry.register(definition);
}

export function registerEquipmentDefinition<TConfig, TSimParameters>(
  definition: EquipmentDefinition<TConfig, TSimParameters>
): void {
  defaultEquipmentRegistry.register(definition);
}

export function resolveEquipmentDefinition(typeId: EquipmentTypeId): EquipmentDefinition | undefined {
  return defaultEquipmentRegistry.resolve(typeId);
}

export function getEquipmentDefinition(typeId: EquipmentTypeId): EquipmentDefinition {
  return defaultEquipmentRegistry.require(typeId);
}

export function listEquipmentDefinitions(): EquipmentDefinition[] {
  return defaultEquipmentRegistry.list();
}

export function instantiateEquipmentDefaults<TConfig = unknown>(
  typeId: EquipmentTypeId
): TConfig {
  return defaultEquipmentRegistry.instantiateDefaults<TConfig>(typeId);
}

export function instantiatePorts(typeId: EquipmentTypeId): Record<PortId, DiagramPort> {
  return defaultEquipmentRegistry.materializePorts(typeId);
}
