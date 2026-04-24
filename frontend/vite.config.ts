import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite" // 1. Tambahkan import ini

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 2. Daftarkan plugin di sini
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})