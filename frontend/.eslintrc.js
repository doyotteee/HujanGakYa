module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'react-app',
    'react-app/jest'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // React specific rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'warn',
    
    // General JavaScript rules
    'no-unused-vars': 'warn',
    'no-console': 'off', // Allow console for debugging in development
    'no-debugger': 'warn',
    'prefer-const': 'warn',
    'no-var': 'error',
    
    // Code style rules
    'indent': ['warn', 2],
    'quotes': ['warn', 'single'],
    'semi': ['warn', 'always'],
    'object-curly-spacing': ['warn', 'always'],
    'array-bracket-spacing': ['warn', 'never'],
    
    // Performance rules
    'prefer-template': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
