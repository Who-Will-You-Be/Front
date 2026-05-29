import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const modelUrl = env.VITE_MODEL_URL || 'http://localhost:8001'
  const apiBase = env.VITE_API_BASE_URL || 'http://localhost:8080'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/neis': {
          target: 'https://open.neis.go.kr',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api\/neis/, ''),
        },
        '/api/auth': {
          target: apiBase,
          changeOrigin: true,
        },
        '/api/ollama': {
          target: apiBase,
          changeOrigin: true,
        },
        '/recommend': {
          target: modelUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
