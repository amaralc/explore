const esbuild = require('esbuild');
const tsconfigPaths = require('esbuild-plugin-tsconfig-paths');

esbuild.build({
  entryPoints: ['apps/kernel/taxonomic-units/rest-api/src/main.ts'],
  outdir: 'dist/apps/kernel/taxonomic-units/rest-api',
  plugins: [
    tsconfigPaths({
      tsconfig: 'apps/kernel/taxonomic-units/rest-api/tsconfig.app.json'
    })
  ],
  platform: 'node',
  target: 'node22',
  bundle: true,
  sourcemap: true,
}).catch(() => process.exit(1));