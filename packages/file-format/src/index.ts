import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { DiagramGraph, FluidProfile } from "@fluiddiagram/domain";
import { PROJECT_EXTENSION } from "@fluiddiagram/shared";

export const PROJECT_FORMAT_VERSION = 1;
export const PROJECT_FILE_NAME = "project.fd.json";

export const PROJECT_DIRS = {
  assets: "assets",
  libraries: "libraries",
  snapshots: "snapshots",
  results: "results",
  metadata: "metadata"
} as const;

const nodeSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["Tank", "CentrifugalPump", "BallValve", "Pipe"]),
  label: z.string(),
  config: z.unknown(),
  position: z.object({ x: z.number(), y: z.number() })
});

const edgeSchema = z.object({
  id: z.string().min(1),
  from: z.object({ nodeId: z.string().min(1), port: z.string().min(1) }),
  to: z.object({ nodeId: z.string().min(1), port: z.string().min(1) })
});

const fluidSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  densityKgPerM3: z.number().positive(),
  viscosityPaS: z.number().positive()
});

const projectMetadataSchema = z.object({
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const projectSchema = z.object({
  formatVersion: z.literal(PROJECT_FORMAT_VERSION),
  metadata: projectMetadataSchema,
  graph: z.object({
    nodes: z.record(nodeSchema),
    edges: z.record(edgeSchema)
  }),
  fluids: z.array(fluidSchema),
  activeFluidId: z.string().min(1)
});

export type ProjectMetadata = z.infer<typeof projectMetadataSchema>;
export type FluidDiagramProject = z.infer<typeof projectSchema>;

export interface CreateProjectOptions {
  projectId?: string;
  now?: Date;
}

export function createEmptyProject(
  projectName: string,
  options: CreateProjectOptions = {}
): FluidDiagramProject {
  const nowIso = (options.now ?? new Date()).toISOString();
  const defaultFluid: FluidProfile = {
    id: "water-20c",
    displayName: "Water (20°C)",
    densityKgPerM3: 998,
    viscosityPaS: 0.001
  };

  return {
    formatVersion: PROJECT_FORMAT_VERSION,
    metadata: {
      projectId: options.projectId ?? randomUUID(),
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

export function validateProject(project: unknown): FluidDiagramProject {
  return projectSchema.parse(project);
}

export function updateProjectGraph(
  project: FluidDiagramProject,
  graph: DiagramGraph,
  now: Date = new Date()
): FluidDiagramProject {
  return {
    ...project,
    metadata: {
      ...project.metadata,
      updatedAt: now.toISOString()
    },
    graph
  };
}

export function isProjectFolderName(name: string): boolean {
  return name.endsWith(PROJECT_EXTENSION);
}
