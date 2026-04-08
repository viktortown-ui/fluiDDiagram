import { app, BrowserWindow } from "electron";
import { join } from "node:path";
import { ProjectStorageService, AppStorageService } from "@fluiddiagram/storage";

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

  await mainWindow.loadFile(new URL("../../index.html", import.meta.url).pathname);
}

async function ensureWorkspaceSeed(): Promise<void> {
  const appStorage = new AppStorageService(app);
  const projectStorage = new ProjectStorageService();

  const dirs = await appStorage.ensureBaseDirectories();
  const seedProjectDir = join(dirs.projects, "getting-started.fdproj");

  if (await projectStorage.projectExists(seedProjectDir)) {
    return;
  }

  await projectStorage.createProject({
    parentDir: dirs.projects,
    projectName: "Getting Started",
    projectId: "getting-started"
  });
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
