const esbuild = require('esbuild');
const tsconfigPaths = require('esbuild-plugin-tsconfig-paths');

esbuild.build({
  entryPoints: ['teams/kernel/taxonomic-units/rest-api/src/main.ts'],
  outdir: 'dist/teams/kernel/taxonomic-units/rest-api',
  plugins: [
    tsconfigPaths({
      tsconfig: 'teams/kernel/taxonomic-units/rest-api/tsconfig.app.json'
    })
  ],
  platform: 'node',
  target: 'node22',
  bundle: true,
  sourcemap: true,
}).catch(() => process.exit(1));