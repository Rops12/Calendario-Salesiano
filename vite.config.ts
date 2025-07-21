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
  // SEÇÃO 'build' AJUSTADA
  build: {
    rollupOptions: {
      external: [], // A lista de dependências externas agora está vazia
    }
  }
})
