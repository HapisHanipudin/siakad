import parser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    ignores: [
      ".next",
      ".open-next",
      ".git",
      "node_modules",
      "cloudflare-env.d.ts",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: "readonly",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      react,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react-hooks/rules-of-hooks": "error",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
