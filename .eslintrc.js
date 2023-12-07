module.exports = {
  env: {
    node: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.js}"],
      parserOptions: {
        sourceType: "script",
      },
    },
    {
      env: {
        browser: true,
        es2021: true,
      },
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
    },
  ],
  rules: {},
  ignorePatterns: ["*.html", "dist/*", "src/js/*"],
};
