import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/present': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/issue': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/verify': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/receive-vc': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/generate-did': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/revoke': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/status': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})

