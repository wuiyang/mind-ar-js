import { defineConfig } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import js from "@eslint/js";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"] },
  { ignores: ["testing/**/*", "src/libs/**/*", "dist/**/*"] },
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.browser } },
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
  stylistic.configs.customize({
    // the following options are the default values
    indent: 2,
    quotes: "double",
    semi: true,
    jsx: false,
    braceStyle: "1tbs",
    commaDangle: "always-multiline",
  }),
  {
    rules: {
      "require-await": ["error"],
      "no-unused-vars": [
        "error", {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@stylistic/quotes": ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }],
    },
  },
]);
