import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 9999,
    proxy: {
      '/api': {
        target: 'http://localhost:9998',
        changeOrigin: true,
      },
    },
  },
});