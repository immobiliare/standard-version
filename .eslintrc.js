'use strict';

module.exports = {
  env: {
    es6: true,
    node: true,
    commonjs: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
  },
  rules: {
    'node/no-unpublished-require': 'off',
  },
};
