import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/claude': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/claude/, ''),
      },
      '/api/neis': {
        target: 'https://open.neis.go.kr',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/neis/, ''),
      },
      '/api/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/ollama': {
<<<<<<< HEAD
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/model': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/model/, ''),
=======
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/ollama/, ''),
>>>>>>> c42df025a017331aba6fe69b38a2f6c37c23c874
      },
    },
  },
})
