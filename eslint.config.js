const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const globals = require("globals");

module.exports = tseslint.config(
  { ignores: ["**/*.html", "dist/**", "src/js/**"] },
  js.configs.recommended,
  { languageOptions: { globals: globals.node } },
  {
    files: ["**/*.ts"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2021 },
    },
  }
);
