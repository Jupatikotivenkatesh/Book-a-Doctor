import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // ─── Dev Server ───────────────────────────────────────────────────────────
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // ─── Path Aliases ─────────────────────────────────────────────────────────
  resolve: {
    alias: {
      "@": "/src",
    },
  },

  // ─── Build Optimization ───────────────────────────────────────────────────
  build: {
    target: "es2015",
    // Raise chunk warning threshold (antd is unavoidably large)
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — shared across everything
          "vendor-react": ["react", "react-dom"],

          // Router
          "vendor-router": ["react-router-dom"],

          // Redux
          "vendor-redux": ["@reduxjs/toolkit", "react-redux"],

          // Axios
          "vendor-axios": ["axios"],

          // Dayjs
          "vendor-dayjs": ["dayjs"],

          // Ant Design core (unavoidably large — isolated so other chunks stay small)
          "vendor-antd": ["antd"],

          // Ant Design icons (separate so they tree-shake independently)
          "vendor-antd-icons": ["@ant-design/icons"],
        },
      },
    },
  },
});
