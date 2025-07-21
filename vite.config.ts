import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // ADICIONE ESTA SEÇÃO 'build' COMPLETA
  build: {
    rollupOptions: {
      external: ['jspdf'], // Apenas jspdf aqui
    }
  }
})
