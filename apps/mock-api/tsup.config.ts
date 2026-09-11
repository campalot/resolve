import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['server.ts'],
  format: ['esm'],
  target: 'es2022',
  clean: true,
  noExternal: [
    /^@resolve\//,
  ],
});