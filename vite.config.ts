import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  esbuild: {
    // Ignorer les erreurs TypeScript pendant le build - le JS généré est fonctionnel
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: 'all',
    host: true,
  },
})
