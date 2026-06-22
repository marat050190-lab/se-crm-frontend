import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['socket.io-client']
  },
  build: {
    commonjsOptions: {
      include: [/socket\.io-client/, /node_modules/]
    }
  }
})
