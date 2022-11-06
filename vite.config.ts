import { presetIcons, presetUno, transformerDirectives } from "unocss";
import pluginUnocss from "unocss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "voby",
  },
  test: {
    environment: "happy-dom",
  },
  plugins: [
    pluginUnocss({
      presets: [presetUno(), presetIcons()],
      transformers: [transformerDirectives()],
      shortcuts: [
        [
          /^icon-(.+?)(-filled)?$/,
          ([, icon, filled]) => {
            return `i-fluent:${icon}-20-${filled ? "filled" : "regular"}`;
          },
        ],
      ],
    }),
  ],
});
