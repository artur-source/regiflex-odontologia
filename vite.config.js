import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "../RegiFlex-Core/frontend/src/core"),
      "@": path.resolve(__dirname, "./frontend/src/modules/odontologia/src"),
    },
  },
  root: path.resolve(__dirname, 'frontend/src/modules/odontologia'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  }
})
