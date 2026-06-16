import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';

/**
 * Dev-only middleware that serves parquet files from the backend's datasets
 * directory so the browser can read & preview dataset contents.
 *
 * The frontend requests `/__dataset-file?path=<absolute .parquet path>`; the
 * file is streamed only if it resolves inside VITE_DATASETS_DIR and is a
 * .parquet file. In production this should be replaced by a backend endpoint.
 */
function datasetFilesPlugin(): Plugin {
  const root = path.resolve(
    process.env.VITE_DATASETS_DIR ?? path.join(os.homedir(), 'ml-runner-backend/datasets'),
  );

  return {
    name: 'dataset-files',
    configureServer(server) {
      server.middlewares.use('/__dataset-file', (req, res) => {
        const sendError = (code: number, message: string) => {
          res.statusCode = code;
          res.end(message);
        };
        try {
          const url = new URL(req.url ?? '', 'http://localhost');
          const target = url.searchParams.get('path');
          if (!target) return sendError(400, 'missing path');

          const realRoot = fs.realpathSync(root);
          const real = fs.realpathSync(path.resolve(target));
          if (real !== realRoot && !real.startsWith(realRoot + path.sep)) {
            return sendError(403, 'forbidden');
          }
          if (path.extname(real) !== '.parquet') {
            return sendError(403, 'only .parquet files are allowed');
          }

          const stat = fs.statSync(real);
          res.setHeader('Content-Type', 'application/octet-stream');
          res.setHeader('Content-Length', stat.size);
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Cache-Control', 'no-cache');
          fs.createReadStream(real).pipe(res);
        } catch {
          sendError(404, 'file not found');
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), datasetFilesPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          charts: ['recharts'],
          query: ['@tanstack/react-query'],
          parquet: ['hyparquet', 'hyparquet-compressors'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the backend during development.
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
