import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/unified-portal/",
  resolve: {
    alias: {
      "@/components": path.resolve(__dirname, "./src/shared"),
      "@/lib": path.resolve(__dirname, "./src/shared/lib"),
      "@/hooks": path.resolve(__dirname, "./src/shared/hooks"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
})
