import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  server: {
    host: true,
    strictPort: true,
    port: 5173,
    proxy: {
      '/ws': { target: `ws://127.0.0.1:${process.env.MARK47_BACKEND_PORT || 3001}`, ws: true },
      '/api': {
        target: `http://127.0.0.1:${process.env.MARK47_BACKEND_PORT || 3001}`,
        changeOrigin: true
      }
    }
  }
});
