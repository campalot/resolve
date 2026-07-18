import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import * as sass from 'sass'; 

export default defineConfig({
  plugins: [react(),svgr()],
  optimizeDeps: {
    exclude: ['@resolve/ui']
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    preprocessorOptions: {
      // Bypasses the outdated TypeScript definition safely
      scss: {
        api: 'modern-compiler', 
        importers: [new sass.NodePackageImporter()] 
      } as unknown as Record<string, unknown>,
    }
  }
});
