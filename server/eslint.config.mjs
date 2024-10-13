import js from "@eslint/js";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config({
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  files: ["**/*.{js,mjs,cjs,ts}"],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.node,
  },
  plugins: {
    "simple-import-sort": simpleImportSort,
    "unused-imports": unusedImports,
  },
  rules: {
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          ["^@?\\w"], // external packages
          ["^~"], // Internal imports (e.g., `~/`)
          ["^\\.\\.(?!/?$)", "^\\./"], // Parent imports, followed by other relative imports.
          ["^\\u0000"], // Side effect imports
          ["^.+\\.?(css)$"], // Style imports
        ],
      },
    ],
    "simple-import-sort/exports": "error",
    "@typescript-eslint/no-unused-vars": "off",
    "no-unused-vars": "off",
    "no-duplicate-imports": "error",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
  },
});
