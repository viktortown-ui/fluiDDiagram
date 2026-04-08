import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { basename, join } from "node:path";
import {
  PROJECT_DIRS,
  PROJECT_FILE_NAME,
  createEmptyProject,
  parseProjectFile,
  serializeProject,
  type FluidDiagramProject
} from "@fluiddiagram/file-format";
import { APP_NAME, PROJECT_EXTENSION } from "@fluiddiagram/shared";

export type ElectronPathName = "userData" | "temp";

export interface AppPathProvider {
  getPath(name: ElectronPathName): string;
}

export interface AppStoragePaths {
  root: string;
  config: string;
  logs: string;
  cache: string;
  db: string;
  projects: string;
  autosaveMetadata: string;
  temp: string;
}

export class AppStorageService {
  public constructor(private readonly paths: AppPathProvider) {}

  public resolvePaths(): AppStoragePaths {
    const userDataRoot = this.paths.getPath("userData");

    return {
      root: userDataRoot,
      config: join(userDataRoot, "config"),
      logs: join(userDataRoot, "logs"),
      cache: join(userDataRoot, "cache"),
      db: join(userDataRoot, "db"),
      projects: join(userDataRoot, "projects"),
      autosaveMetadata: join(userDataRoot, "autosave-metadata"),
      temp: join(this.paths.getPath("temp"), APP_NAME)
    };
  }

  public async ensureBaseDirectories(): Promise<AppStoragePaths> {
    const dirs = this.resolvePaths();
    await Promise.all(Object.values(dirs).map(async (dir) => mkdir(dir, { recursive: true })));
    return dirs;
  }
}

export interface CreateProjectInput {
  parentDir: string;
  projectName: string;
  projectId?: string;
}

export interface AutosaveSnapshot {
  path: string;
  createdAt: string;
}

export interface CreateProjectResult {
  projectDir: string;
  projectFile: string;
  project: FluidDiagramProject;
}

export class ProjectStorageService {
  public async createProject(input: CreateProjectInput): Promise<CreateProjectResult> {
    const project = createEmptyProject(input.projectName, { projectId: input.projectId });
    const safeName = toProjectFolderName(input.projectName);
    const projectDir = join(input.parentDir, `${safeName}${PROJECT_EXTENSION}`);

    await this.ensureProjectLayout(projectDir);
    await this.saveProject(projectDir, project);

    return {
      projectDir,
      projectFile: join(projectDir, PROJECT_FILE_NAME),
      project
    };
  }

  public async openProject(projectDir: string): Promise<FluidDiagramProject> {
    return this.readProject(projectDir);
  }

  public async readProject(projectDir: string): Promise<FluidDiagramProject> {
    const raw = await readFile(join(projectDir, PROJECT_FILE_NAME), "utf-8");
    return parseProjectFile(raw);
  }

  public async saveProject(projectDir: string, project: FluidDiagramProject): Promise<void> {
    await this.ensureProjectLayout(projectDir);
    await writeFile(join(projectDir, PROJECT_FILE_NAME), serializeProject(project), "utf-8");
  }

  public async createAutosaveSnapshot(
    projectDir: string,
    project: FluidDiagramProject,
    timestamp: Date = new Date()
  ): Promise<AutosaveSnapshot> {
    const snapshotsDir = join(projectDir, PROJECT_DIRS.snapshots);
    await mkdir(snapshotsDir, { recursive: true });

    const createdAt = timestamp.toISOString();
    const stamp = toSnapshotStamp(createdAt);
    const filename = `snapshot-${stamp}.fd.json`;
    const path = join(snapshotsDir, filename);

    await writeFile(path, serializeProject(project), "utf-8");

    return { path, createdAt };
  }

  public async ensureProjectLayout(projectDir: string): Promise<void> {
    const projectFolder = basename(projectDir);
    if (!projectFolder.endsWith(PROJECT_EXTENSION)) {
      throw new Error(`Project folder must end with ${PROJECT_EXTENSION}: ${projectDir}`);
    }

    await mkdir(projectDir, { recursive: true });
    await Promise.all(
      Object.values(PROJECT_DIRS).map(async (directory) => mkdir(join(projectDir, directory), { recursive: true }))
    );
  }

  public async projectExists(projectDir: string): Promise<boolean> {
    try {
      await access(join(projectDir, PROJECT_FILE_NAME), fsConstants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}

function toProjectFolderName(name: string): string {
  const compact = name.trim().replace(/\s+/g, "-");
  return compact.replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase() || "project";
}

function toSnapshotStamp(isoTime: string): string {
  return isoTime.replace(/[:.]/g, "-");
}
