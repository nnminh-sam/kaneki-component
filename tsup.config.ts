import { copyFileSync } from "fs";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  target: "es2022",
  banner: {
    js: '"use client";',
  },
  external: ["react", "react-dom"],
  onSuccess: async () => {
    copyFileSync("src/styles.css", "dist/index.css");
  },
});
