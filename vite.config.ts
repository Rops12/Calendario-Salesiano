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
  build: {
    rollupOptions: {
      // MUDANÇA: Mapeando os pacotes externos para as variáveis globais que a CDN cria
      external: ['jspdf', 'jspdf-autotable'],
      output: {
        globals: {
          jspdf: 'jspdf',
          'jspdf-autotable': 'jspdf.plugin.autotable'
        }
      }
    }
  }
})
