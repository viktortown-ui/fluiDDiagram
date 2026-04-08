import { z } from "zod";
import type { DiagramGraph, FluidProfile } from "@fluiddiagram/domain";

export const PROJECT_FILE_NAME = "project.fd.json";
export const AUTOSAVE_DIR = "autosave";

const nodeSchema = z.object({
  id: z.string(),
  kind: z.enum(["Tank", "CentrifugalPump", "BallValve", "Pipe"]),
  label: z.string(),
  config: z.unknown(),
  position: z.object({ x: z.number(), y: z.number() })
});

const edgeSchema = z.object({
  id: z.string(),
  from: z.object({ nodeId: z.string(), port: z.string() }),
  to: z.object({ nodeId: z.string(), port: z.string() })
});

const fluidSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  densityKgPerM3: z.number().positive(),
  viscosityPaS: z.number().positive()
});

export const projectSchema = z.object({
  version: z.literal(1),
  metadata: z.object({
    projectName: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
  }),
  graph: z.object({
    nodes: z.record(nodeSchema),
    edges: z.record(edgeSchema)
  }),
  fluids: z.array(fluidSchema),
  activeFluidId: z.string()
});

export type FluidDiagramProject = z.infer<typeof projectSchema>;

export function createEmptyProject(projectName: string): FluidDiagramProject {
  const nowIso = new Date().toISOString();
  const defaultFluid: FluidProfile = {
    id: "water-20c",
    displayName: "Water (20°C)",
    densityKgPerM3: 998,
    viscosityPaS: 0.001
  };

  return {
    version: 1,
    metadata: {
      projectName,
      createdAt: nowIso,
      updatedAt: nowIso
    },
    graph: {
      nodes: {},
      edges: {}
    },
    fluids: [defaultFluid],
    activeFluidId: defaultFluid.id
  };
}

export function serializeProject(project: FluidDiagramProject): string {
  return JSON.stringify(projectSchema.parse(project), null, 2);
}

export function parseProjectFile(contents: string): FluidDiagramProject {
  const parsed = JSON.parse(contents) as unknown;
  return projectSchema.parse(parsed);
}

export function updateProjectGraph(
  project: FluidDiagramProject,
  graph: DiagramGraph
): FluidDiagramProject {
  return {
    ...project,
    metadata: {
      ...project.metadata,
      updatedAt: new Date().toISOString()
    },
    graph
  };
}
