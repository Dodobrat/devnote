import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx,js}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^react", "^@?\\w"], // React and other external packages
            ["^~"], // Internal imports (e.g., `~/`)
            ["^\\.\\.(?!/?$)", "^\\./"], // Parent imports, followed by other relative imports.
            ["^\\u0000"], // Side effect imports
            ["^.+\\.?(css)$"], // Style imports
          ],
        },
      ],
      "simple-import-sort/exports": "error",
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
  },
);
