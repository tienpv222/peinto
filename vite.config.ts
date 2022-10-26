import { presetIcons, presetUno, transformerDirectives } from "unocss";
import pluginUnocss from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig({
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
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "voby",
  },
});
