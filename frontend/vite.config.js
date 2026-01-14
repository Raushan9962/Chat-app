import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // 🔥 IMPORTANT: simple-peer / randombytes fix
  define: {
    global: "window",
  },

  optimizeDeps: {
    include: ["simple-peer", "buffer", "process"],
  },

  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
  },

  server: {
    host: "localhost",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
