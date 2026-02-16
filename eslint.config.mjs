import globals from "globals";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import vitest from "@vitest/eslint-plugin";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([
  // Global ignores
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "lib/**",
      "tmp/**",
    ],
  },
  // TypeScript source files (with type-aware linting)
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: ["./tsconfig.json"],
      },
      globals: {
        ...globals.commonjs,
        ...globals.node,
      },
    },
    plugins: {
      js,
      vitest,
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      "no-unused-vars": "warn",
      "comma-dangle": ["error", "always-multiline"],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-function": "off",
      "vitest/expect-expect": "off",
      "vitest/no-identical-title": "off",
    },
  },
  // Config files (TS without project reference)
  {
    files: ["*.ts", "*.mjs"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      globals: {
        ...globals.node,
      },
    },
  },
  // JavaScript files
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      globals: {
        ...globals.commonjs,
        ...globals.node,
      },
    },
    plugins: {
      js,
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "no-unused-vars": "warn",
      "comma-dangle": ["error", "always-multiline"],
      "vitest/expect-expect": "off",
      "vitest/no-identical-title": "off",
    },
  },
]);
