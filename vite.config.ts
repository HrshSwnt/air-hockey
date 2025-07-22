import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/air-hockey/',
  plugins: [react()],
  server: {
    proxy: {
      '/socket.io': 'http://localhost:3000',
      '/api': 'http://localhost:3000'
    }
  }
});
