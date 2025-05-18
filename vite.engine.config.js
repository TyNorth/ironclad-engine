// vite.engine.config.js
import { defineConfig } from 'vite'
import { resolve } from 'node:path' // For resolving paths correctly

// If using ES module syntax for this config file and __dirname is not available by default:
// import { fileURLToPath } from 'node:url';
// import { dirname } from 'node:path';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename); // This gives the directory of THIS config file.

export default defineConfig({
  // If your engine source itself doesn't use Vue components,
  // you likely don't need these plugins for the *engine library* build.
  // plugins: [vue(), vueDevTools()],

  resolve: {
    alias: {
      // If this config file is in the project root:
      '@': resolve('src'),
      // OR, if you prefer using __dirname (ensure it's correctly defined as above for ES modules):
      // '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      // Corrected entry path, assuming this config file is in the project root:
      entry: resolve('src/engine/index.js'),
      // OR, using __dirname (ensure it's correctly defined for ES modules as above):
      // entry: resolve(__dirname, 'src/engine/index.js'),

      name: 'IroncladEngine', // Global variable name for UMD build
      formats: ['es', 'umd', 'cjs'], // Output formats
      fileName: (format) =>
        `ironclad-engine.${format === 'umd' ? 'umd.cjs' : format === 'cjs' ? 'cjs' : 'js'}`,
    },
    rollupOptions: {
      // Optional: Make sure to externalize deps that shouldn't be bundled
      // external: [],
      // output: {
      //   globals: {},
      // },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
})
