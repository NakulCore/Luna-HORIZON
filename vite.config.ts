import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Listen on all IP addresses (0.0.0.0, localhost, 127.0.0.1)
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
