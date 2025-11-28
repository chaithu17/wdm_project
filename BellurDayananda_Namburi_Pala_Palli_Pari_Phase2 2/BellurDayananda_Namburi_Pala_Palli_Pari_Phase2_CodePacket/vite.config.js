import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Correct setup for Vite + React Router
export default defineConfig({
  plugins: [react()],
  server: {
    // This ensures direct refreshes work in dev mode
    historyApiFallback: true
  },
  preview: {
    // This ensures preview (vite preview) also supports SPA fallback
    historyApiFallback: true
  },
  build: {
    outDir: 'dist', // default
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
    globals: true,
    css: true,
  }
})
