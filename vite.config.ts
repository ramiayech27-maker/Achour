
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // حقن متغيرات البيئة من نظام Netlify أو ملف .env داخل الكود النهائي
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || ''),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || '')
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
        }
      }
    }
  }
});
