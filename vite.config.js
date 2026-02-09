const { resolve } = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  root: '.',
  base: './',
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
});

