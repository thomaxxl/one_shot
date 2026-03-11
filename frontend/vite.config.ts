import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_BACKEND_ORIGIN || "http://127.0.0.1:5656";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": target,
        "/ui": target,
        "/openapi.json": target,
        "/swagger.json": target,
      },
    },
  };
});
