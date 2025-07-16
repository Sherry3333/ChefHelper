import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/recipes': 'http://localhost:5218',
      '/myrecipe': 'http://localhost:5218',
      '/auth': 'http://localhost:5218',
      '/user': 'http://localhost:5218',
      '/favorites': 'http://localhost:5218',
      '/votes': 'http://localhost:5218',
      '/ai': 'http://localhost:5218'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js'
  }
})
