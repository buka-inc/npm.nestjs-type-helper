import { defineConfig } from 'tsup'

export default defineConfig([
  {
    name: 'main',
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    tsconfig: 'tsconfig.lib.json',
    platform: 'node',
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
  },
])
