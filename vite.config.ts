import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost', // or your PHP server URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Adjust if your PHP server expects /api or not
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('recharts')) return 'vendor-recharts';
          if (id.includes('jspdf')) return 'vendor-jspdf';
          if (id.includes('html2canvas')) return 'vendor-html2canvas';
          if (id.includes('@supabase/supabase-js')) return 'vendor-supabase';
          if (id.includes('react-router-dom')) return 'vendor-react-router';
          if (id.includes('react-dom') || id.includes('react')) return 'vendor-react';
          return 'vendor';
        },
      },
    },
  },
}));
