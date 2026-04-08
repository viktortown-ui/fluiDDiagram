import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseProjectFile, serializeProject, type FluidDiagramProject } from "@fluiddiagram/file-format";
import { PROJECT_EXTENSION, PROJECT_FILE_NAME } from "@fluiddiagram/shared";

export async function createProjectFolder(rootDir: string, projectId: string): Promise<string> {
  const projectDir = join(rootDir, `${projectId}${PROJECT_EXTENSION}`);
  await mkdir(projectDir, { recursive: true });
  return projectDir;
}

export async function writeProject(projectDir: string, project: FluidDiagramProject): Promise<void> {
  await writeFile(join(projectDir, PROJECT_FILE_NAME), serializeProject(project), "utf-8");
}

export async function readProject(projectDir: string): Promise<FluidDiagramProject> {
  const raw = await readFile(join(projectDir, PROJECT_FILE_NAME), "utf-8");
  return parseProjectFile(raw);
}
