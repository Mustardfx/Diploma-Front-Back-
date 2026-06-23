import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Цель прокси = бэкенд. Дев-сервер работает в Docker, поэтому дефолт —
  // имя docker-сервиса. Переопределить можно через BACKEND_URL.
  // НЕ путать с VITE_API_URL (baseURL axios), иначе прокси шлёт сам в себя.
  const backendUrl =
    process.env.BACKEND_URL || env.BACKEND_URL || 'http://sportportal-backend:8080'

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,         
      watch: {
        usePolling: true, 
      },
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
