import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  optimizeDeps: {
    include: ['zustand'],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  plugins: [react()],
})
