import js from '@eslint/js';
import globals from 'globals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    ignores: ['build', 'gulpfile.mjs'], // Ignorar todo en el directorio `build/`
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      semi: ['error', 'never'],
      curly: 'error',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  eslintPluginPrettierRecommended,
  eslintConfigPrettier,
];
