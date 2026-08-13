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
      jsx: true, // تفعيل دعم JSX لملفات React
    },
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'no-useless-escape': 'warn', // تحويل أخطاء الـ Escape إلى تحذير فقط
  },
};
