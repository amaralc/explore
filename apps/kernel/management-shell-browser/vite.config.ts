/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const deriveFileNameFromChunkInfo = (chunkInfo: { facadeModuleId: string | null }): string => {
  if (!chunkInfo.facadeModuleId) {
    return 'assets/js/[name]-[hash].js';
  }

  const basename = path.basename(chunkInfo.facadeModuleId);
  if (basename.startsWith('@')) {
    return 'assets/js/[name]-[hash].js';
  }

  const ext = path.extname(chunkInfo.facadeModuleId);
  const outputFileName = chunkInfo.facadeModuleId.replace(__dirname, 'assets/js').replace(ext, '.js');
  return outputFileName;
};

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../../dist/apps/kernel/management-shell-browser',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        chunkFileNames: deriveFileNameFromChunkInfo,
        entryFileNames: deriveFileNameFromChunkInfo,
        assetFileNames: 'assets/[ext]/[name].[ext]',
      },
    },
  },
  cacheDir: '../../../node_modules/.vite/kernel-management-shell-browser',
  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      allow: [
        // search up for workspace root (https://vitejs.dev/config/server-options.html#server-fs-allow)
        searchForWorkspaceRoot(process.cwd()),
      ],
    },
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    viteTsConfigPaths({
      root: '../../../',
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../../',
  //    }),
  //  ],
  // },

  test: {
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/apps/kernel/management-shell-browser',
      provider: 'v8',
    },
    globals: true,
    cache: {
      dir: '../../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },

  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      // {
      //   find: /^src(.+)/,
      //   replacement: path.join(process.cwd(), 'src/$1'),
      // },
    ],
  },
});
