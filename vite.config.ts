import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.org/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: true,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Function form: each npm package is pinned to a named chunk, and Vite's
        // preload helper stays in the static graph (it was previously merged into
        // the vendor-pdf chunk, which forced the 600KB chunk onto every page load).
        manualChunks(id) {
          // Keep Vite's preload helper inside a chunk the entry already loads
          if (id.includes('preload-helper') || id.includes('\0vite/')) return 'vendor-react';
          if (!id.includes('node_modules')) return undefined;

          const parts = id.split('node_modules/').pop()!.split('/');
          const pkg = parts[0].startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];

          if (['react', 'react-dom', 'react-router-dom', 'react-router', 'scheduler'].includes(pkg)) return 'vendor-react';
          if (['clsx', 'tailwind-merge', 'class-variance-authority'].includes(pkg)) return 'vendor-ui';
          if (pkg.startsWith('@radix-ui')) return 'vendor-ui';
          if (pkg.startsWith('@supabase')) return 'vendor-supabase';
          if (pkg === 'framer-motion' || pkg === 'motion-dom' || pkg === 'motion-utils') return 'vendor-motion';
          if (['jspdf', 'html2canvas', 'fflate', 'dompurify'].includes(pkg)) return 'vendor-pdf';
          if (pkg === 'recharts' || pkg.startsWith('d3-') || ['victory-vendor', 'internmap', 'delaunator', 'robust-predicates', 'd3-shape', 'd3-scale', 'd3-array', 'd3-time', 'd3-color', 'd3-interpolate', 'd3-path', 'd3-format', 'd3-time-format', 'd3-ease', 'd3-timer', 'd3-delaunay', 'd3-hierarchy', 'd3-geo'].includes(pkg)) return 'vendor-charts';
          if (pkg === 'fabric') return 'vendor-canvas';
          if (pkg === 'cmdk') return 'vendor-cmdk';
          if (['react-hook-form', 'zod'].includes(pkg) || pkg.startsWith('@hookform')) return 'vendor-form';
          if (['date-fns', 'react-day-picker'].includes(pkg)) return 'vendor-date';
          if (pkg === 'react-markdown' || pkg.startsWith('remark-') || pkg.startsWith('micromark') ||
              pkg.startsWith('mdast-util') || pkg.startsWith('unist-util') || pkg.startsWith('hast-util') ||
              pkg.startsWith('vfile') || pkg === 'unified' || pkg === 'zwitch' || pkg === 'devlop' ||
              pkg === 'ccount' || pkg === 'escape-string-regexp' || pkg === 'trim-lines' ||
              pkg.startsWith('character-entities') || pkg === 'property-information' ||
              pkg === 'space-separated-tokens' || pkg === 'comma-separated-tokens' ||
              pkg === 'decode-named-character-reference' || pkg === 'html-url-attributes' ||
              pkg === 'style-to-object' || pkg === 'inline-style-parser' || pkg === 'rehype-raw' ||
              pkg.startsWith('hast-') || pkg.startsWith('web-namespaces') || pkg === 'html-void-elements') return 'vendor-markdown';
          return undefined;
        },
      },
      // Lazy route chunks must keep their own deps lazy (e.g. recharts for /admin)
      hoistTransitiveImports: false,
    },
    target: 'es2020',
    minify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },
}));
