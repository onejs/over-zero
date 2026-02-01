import { defineConfig } from 'tsup'

export default defineConfig([
  // main entry
  {
    entry: {
      index: 'src/index.ts',
      'index.native': 'src/index.ts',
    },
    format: ['esm', 'cjs'],
    outDir: 'dist/esm',
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-native', '@rocicorp/zero'],
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.mjs' : '.cjs',
      }
    },
  },
  {
    entry: {
      index: 'src/index.ts',
      'index.native': 'src/index.ts',
    },
    format: ['cjs'],
    outDir: 'dist/cjs',
    sourcemap: true,
    external: ['react', 'react-native', '@rocicorp/zero'],
    outExtension() {
      return { js: '.cjs' }
    },
  },
  // server entry
  {
    entry: {
      server: 'src/server.ts',
    },
    format: ['esm'],
    outDir: 'dist/esm',
    dts: true,
    sourcemap: true,
    external: ['react', 'react-native', '@rocicorp/zero'],
    outExtension() {
      return { js: '.mjs' }
    },
  },
  {
    entry: {
      server: 'src/server.ts',
    },
    format: ['cjs'],
    outDir: 'dist/cjs',
    sourcemap: true,
    external: ['react', 'react-native', '@rocicorp/zero'],
    outExtension() {
      return { js: '.cjs' }
    },
  },
])
