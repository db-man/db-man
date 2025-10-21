module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/strict',
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  rules: {
    'no-use-before-define': 'off',
    'no-console': 'off',
    'max-len': 'off',
    '@typescript-eslint/comma-dangle': 'off',
  },
  ignorePatterns: ['babel.config.js'],
};
