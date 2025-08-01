import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: 'es2020',
  outDir: 'dist',
  external: ['@markdown-editor/shared', '@markdown-editor/lexer', '@markdown-editor/ast'],
  tsconfig: './tsconfig.json',
});
