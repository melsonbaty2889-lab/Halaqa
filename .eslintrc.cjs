module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // إظهار تحذيرات فقط بدلاً من إيقاف الـ Build
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'no-useless-escape': 'off',
    'react/prop-types': 'off', // لتعطيل فحص prop-types إذا كنت لا تستخدمه
  },
};
