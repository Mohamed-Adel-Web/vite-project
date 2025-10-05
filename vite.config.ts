import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  assetsInclude: ["**/*.glb", "**/*.wasm"],
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
  optimizeDeps: {
    exclude: ["@zappar/zappar-react-three-fiber", "@zappar/zappar-threejs"],
    include: ["use-sync-external-store/shim/with-selector"],
  },
  resolve: {
    alias: {
      "ua-parser-js": "ua-parser-js/dist/ua-parser.min.js",
    },
    dedupe: [
      "react",
      "react-dom",
      "three",
      "@react-three/fiber",
      "use-sync-external-store",
    ],
  },
});
