module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended"],
  rules: {
    // TypeScript specific rules
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",

    // General JavaScript rules
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "off", // Allow console.log in Lambda functions
    "no-debugger": "error",
    "no-duplicate-imports": "error",
    "no-unused-expressions": "error",
    "prefer-template": "error",
    "object-shorthand": "error",
    "prefer-arrow-callback": "error",
    "arrow-spacing": "error",
    "no-trailing-spaces": "error",
    "eol-last": "error",
    "comma-dangle": ["error", "only-multiline"],
    semi: ["error", "always"],
    quotes: "off", // Allow both single and double quotes
    indent: ["error", 2, { SwitchCase: 1 }],
  },
  env: {
    node: true,
    es6: true,
  },
  ignorePatterns: [
    "node_modules/",
    "src/**/*.js",
    "src/**/*.js.map",
    "src/**/*.d.ts",
    "src/**/*.d.ts.map",
    "**/*.d.ts",
  ],
};
