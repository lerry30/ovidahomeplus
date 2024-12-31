import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias '@' to 'src'
    },
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true
  },
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      secure: false
    },
  }
});
