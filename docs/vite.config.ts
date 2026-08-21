import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { readFileSync } from "fs";

const rootPkg = JSON.parse(readFileSync(path.resolve(import.meta.dirname, "../package.json"), "utf-8"));

export default defineConfig({
  base: "/",
  define: {
    __REAP_VERSION__: JSON.stringify(rootPkg.version),
    // The copyright year is fixed at build time so that the server and the
    // browser agree on it. `new Date().getFullYear()` used to be evaluated in
    // both, which was harmless while the page was rendered only in a browser;
    // once the page is prerendered it becomes a hydration mismatch on a text
    // node every 1 January, and a year that stays stale until someone happens
    // to touch docs/**.
    __BUILD_YEAR__: JSON.stringify(String(new Date().getFullYear())),
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    strictPort: true,
    host: "0.0.0.0",
  },
});
