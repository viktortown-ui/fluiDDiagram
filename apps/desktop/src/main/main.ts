import { app, BrowserWindow } from "electron";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createEmptyProject } from "@fluiddiagram/file-format";
import { createProjectFolder, writeProject } from "@fluiddiagram/storage";

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL ?? "http://127.0.0.1:5173";

async function createWindow(): Promise<void> {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 760,
    webPreferences: {
      preload: new URL("../preload/preload.js", import.meta.url).pathname,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (!app.isPackaged) {
    await mainWindow.loadURL(DEV_SERVER_URL);
    return;
  }

  await mainWindow.loadFile(join(import.meta.dirname, "../../index.html"));
}

async function ensureWorkspaceSeed(): Promise<void> {
  const workspaceRoot = join(app.getPath("userData"), "projects");
  await mkdir(workspaceRoot, { recursive: true });

  const projectDir = await createProjectFolder(workspaceRoot, "getting-started");
  await writeProject(projectDir, createEmptyProject("Getting Started"));
}

app.whenReady().then(async () => {
  await ensureWorkspaceSeed();
  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
