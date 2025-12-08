import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://aion2.plaync.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
      },
      "/ko-kr/api": {
        target: "https://aion2.plaync.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
      },
    },
  },
});
