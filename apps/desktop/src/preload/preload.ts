import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("fluidDiagramApi", {
  version: "0.1.0"
});
