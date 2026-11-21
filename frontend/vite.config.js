import fs from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Fix for Windows OneDrive environment where uv_fs_realpath / realpathSync.native throws EPERM
try {
  if (fs.realpathSync && fs.realpathSync.native) {
    fs.realpathSync.native = fs.realpathSync
  }
} catch (e) {
  // ignore
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
