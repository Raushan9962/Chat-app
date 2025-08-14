import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/, // include .js, .jsx, .ts, .tsx
  },
    server: { host: "localhost", port: 5173 },
    proxy: {
      "/api": "http://localhost:8080"
    }
  
})
