import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

const path = require('path');

export default defineConfig(({command, mode}) => {
  return {
    resolve: {
      alias: {
        '@ui': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      react(),
      dts({
        rollupTypes: true,
        insertTypesEntry: true
      }),
    ],
    build: {
      lib: {
        entry: 'src/index.ts',
        name: 'redux-hooks',
        formats: ['es'],
        fileName: (format) => {
          if (format === 'es') {
            return 'index.js';
          }
          return `index.${format}.js`;
        },
      },
      rollupOptions: {
        external: ['react', 'redux', 'react-redux', '@reduxjs/toolkit', 'lodash'],
        output: {
          globals: {
            react: 'React',
          },
        },
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        }
      },
    },
  };
});
