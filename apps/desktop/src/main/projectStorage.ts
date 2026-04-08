import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  AUTOSAVE_DIR,
  PROJECT_FILE_NAME,
  serializeProject,
  type FluidDiagramProject
} from "@fluiddiagram/storage-format";

export function getAppProjectRoot(userDataPath: string): string {
  return join(userDataPath, "projects");
}

export function buildProjectFolderPath(baseDirectory: string, projectId: string): string {
  return join(baseDirectory, `${projectId}.fdproj`);
}

export async function saveProject(
  projectFolderPath: string,
  project: FluidDiagramProject
): Promise<void> {
  await mkdir(projectFolderPath, { recursive: true });
  await writeFile(join(projectFolderPath, PROJECT_FILE_NAME), serializeProject(project), "utf8");
}

export async function writeAutosaveSnapshot(
  projectFolderPath: string,
  project: FluidDiagramProject
): Promise<string> {
  const autosavePath = join(projectFolderPath, AUTOSAVE_DIR);
  await mkdir(autosavePath, { recursive: true });

  const snapshotName = `${new Date().toISOString().replace(/[:.]/g, "-")}.snapshot.fd.json`;
  const snapshotPath = join(autosavePath, snapshotName);
  await writeFile(snapshotPath, serializeProject(project), "utf8");

  return snapshotPath;
}

export async function listAutosaveSnapshots(projectFolderPath: string): Promise<string[]> {
  const autosavePath = join(projectFolderPath, AUTOSAVE_DIR);
  try {
    return (await readdir(autosavePath)).filter((name) => name.endsWith(".snapshot.fd.json"));
  } catch {
    return [];
  }
}
