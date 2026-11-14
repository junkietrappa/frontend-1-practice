import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mockApi from "./server/server.js";

export default defineConfig({
  plugins: [react(), mockApi()],
});
