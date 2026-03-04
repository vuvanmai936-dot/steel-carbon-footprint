/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: ['eslint:recommended', 'prettier'],
  ignorePatterns: ['dist', 'node_modules', '**/*.html'],
  globals: {
    Vue: 'readonly',
    ElementPlus: 'readonly',
    ElementPlusLocaleZhCn: 'readonly',
    ElementPlusIconsVue: 'readonly',
    GC: 'readonly',
    global: 'readonly',
    module: 'readonly',
    getUnreadCount: 'readonly',
    getMyMessages: 'readonly',
    getClarificationsByTaskId: 'readonly',
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['js/**/*.js', 'public/js/**/*.js'],
      parserOptions: { ecmaVersion: 'latest', sourceType: 'script' },
    },
  ],
};
