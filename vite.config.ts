import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(() => {
  return {
    plugins: [
      vue({
        customElement: true,
      }),
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"),
        name: "AtoaPayWebSdk",
      },
      minify: true,
      rollupOptions: {
        external: [], // If you want to bundle Vue, don't list it as external
        output: {
          globals: {},
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
