import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3002", // ✅ your backend port
        changeOrigin: true,
      },
    },
  },
});

//force build to use env vars from .env file (instead of system env vars) - for development only
