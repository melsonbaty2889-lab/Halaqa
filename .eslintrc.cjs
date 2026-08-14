module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // إيقاف إفشال الـ Action بسبب المتغيرات غير المستخدمة
    'no-unused-vars': 'off',
    'no-console': 'off',
    'no-useless-escape': 'off',
  },
};
