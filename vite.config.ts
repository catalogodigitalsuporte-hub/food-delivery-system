import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Config minimalista, 100% ok no Vercel e local
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'], // opcional
  },
})
