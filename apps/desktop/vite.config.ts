import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@fluiddiagram/runtime-renderer": resolve(__dirname, "../../packages/runtime-renderer/src/index.tsx"),
      "@fluiddiagram/editor-engine": resolve(__dirname, "../../packages/editor-engine/src/index.ts"),
      "@fluiddiagram/sim-core": resolve(__dirname, "../../packages/sim-core/src/index.ts"),
      "@fluiddiagram/equipment-lib": resolve(__dirname, "../../packages/equipment-lib/src/index.ts"),
      "@fluiddiagram/domain": resolve(__dirname, "../../packages/domain/src/index.ts")
    }
  }
});
