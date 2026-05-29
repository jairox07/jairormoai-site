import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      // Forward /api/* to backend during dev
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: path => path,
      },
    },
  },
  build: {
    target: 'ES2022',
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true },
      mangle: true,
    },
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui':   ['lucide-react', 'react-hot-toast', 'clsx'],
          'vendor-api':  ['axios', '@tanstack/react-query', 'zustand'],
        },
      },
    },
  },
  preview: {
    port: 4173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
  },
});
