import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "voby",
  },
});