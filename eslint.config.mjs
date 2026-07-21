import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    rules: {
      'semi': ['error', 'always'],    // Enforce semicolons
      'indent': ['error', 2],         // Enforce 2-space indentation
      'quotes': ['error', 'single']   // Enforce single quotes
    }
  }
];