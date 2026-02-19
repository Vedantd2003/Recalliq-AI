import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // CHANGE THIS LINE: Use 127.0.0.1 instead of localhost
        target: 'http://127.0.0.1:5000', 
        changeOrigin: true,
        secure: false, // Recommended for local dev
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          three: ['three'],
          vendor: ['gsap', 'axios', 'zustand'],
        },
      },
    },
  },
});