import { execSync } from "child_process";
import { copyFileSync } from "fs";
import { defineConfig, type Options } from "tsup";

const shared: Options = {
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  minify: false,
  target: "es2022",
  external: ["react", "react-dom"],
};

export default defineConfig([
  // Main entry: client components, so the bundle carries a "use client" banner.
  {
    ...shared,
    entry: { index: "src/index.ts" },
    // Both configs build in parallel into dist/, and tsup's clean (including the
    // .d.ts clean of the DTS step) would delete the other entry's output. So neither
    // config cleans; `npm run build:lib` empties dist/ first (prebuild:lib).
    clean: false,
    banner: {
      js: '"use client";',
    },
    // Runs once (only this config has it): CSS bundle + source CSS copies.
    onSuccess: async () => {
      execSync("npx @tailwindcss/cli -i src/styles.css -o dist/index.css --minify", {
        stdio: "inherit",
      });
      // Source CSS for apps that run their own Tailwind build (kaneki-components/tailwind.css).
      copyFileSync("src/tokens.css", "dist/tokens.css");
      copyFileSync("src/tailwind.css", "dist/tailwind.css");
    },
  },
  // Server-safe class helpers (kaneki-components/classes): no React, no banner.
  {
    ...shared,
    entry: { classes: "src/classes.ts" },
    clean: false,
  },
]);
