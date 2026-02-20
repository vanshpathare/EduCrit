import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
});

//force build to use env vars from .env file (instead of system env vars) - for development only
