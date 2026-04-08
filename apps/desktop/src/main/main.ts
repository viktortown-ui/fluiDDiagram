import { app, BrowserWindow } from "electron";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

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
  const projectDir = join(workspaceRoot, "getting-started.fdproj");
  const projectFile = join(projectDir, "project.fd.json");
  const now = new Date().toISOString();

  await mkdir(projectDir, { recursive: true });
  await writeFile(
    projectFile,
    JSON.stringify(
      {
        version: 1,
        metadata: { projectName: "Getting Started", createdAt: now, updatedAt: now },
        graph: { nodes: {}, edges: {} },
        fluids: [
          {
            id: "water-20c",
            displayName: "Water (20°C)",
            densityKgPerM3: 998,
            viscosityPaS: 0.001
          }
        ],
        activeFluidId: "water-20c"
      },
      null,
      2
    ),
    "utf-8"
  );
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
