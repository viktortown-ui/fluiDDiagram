import { app, BrowserWindow } from "electron";
import { mkdir } from "node:fs/promises";
import { getAppProjectRoot } from "./projectStorage.js";

async function createWindow(): Promise<void> {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      preload: new URL("../preload/preload.js", import.meta.url).pathname,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // UI bundling and loading strategy will be introduced after module boundaries stabilize.
  await mainWindow.loadURL("data:text/html,<div id='root'></div>");
}

app.whenReady().then(async () => {
  await mkdir(getAppProjectRoot(app.getPath("userData")), { recursive: true });
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
