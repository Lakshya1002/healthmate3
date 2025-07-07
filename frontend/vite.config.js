import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This is the proxy configuration
    proxy: {
      // Any request starting with /api will be forwarded
      '/api': {
        // The target is your backend server
        target: 'http://localhost:5000',
        // This is important for virtual hosts
        changeOrigin: true,
        // Optional: you can remove the /api prefix if your backend doesn't expect it
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
