import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "@fluiddiagram/runtime-renderer";
import { createRendererModel } from "./bootstrap.js";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Missing root element.");
}

createRoot(rootElement).render(<App model={createRendererModel()} />);
