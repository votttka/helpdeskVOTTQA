import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // base НЕ нужен для Cloudflare Pages / Vercel / Netlify (деплой в корень).
  // Раскомментируйте и укажите имя репозитория только для GitHub Pages:
  // base: '/helpdesk-prototype/',
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
