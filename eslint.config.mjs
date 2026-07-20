// import js from "@eslint/js";
// import globals from "globals";
// import { defineConfig } from "eslint/config";

// export default defineConfig([
//   { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
//   { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
// ]);

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