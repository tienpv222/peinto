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
      presets: [
        presetUno(),
        presetIcons({
          customizations: {
            iconCustomizer(_collection, _icon, props) {
              const [_x, _y, width, height] = props.viewBox.split(" ");
              props.width = `${width}px`;
              props.height = `${height}px`;
            },
          },
        }),
      ],
      transformers: [transformerDirectives()],
      shortcuts: [
        [
          /^icon-(.+?)(-filled)?$/,
          ([, icon, filled]) => {
            return `i-fluent:${icon}-${filled ? "filled" : "regular"}`;
          },
        ],
      ],
    }),
  ],
});
