import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// In development, proxy API and WebSocket traffic to the local FastAPI server.
// In production, the frontend and API are served by the same FastAPI/Render origin.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
