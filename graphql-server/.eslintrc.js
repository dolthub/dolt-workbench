module.exports = {
  root: true,
  env: {
    node: true,
    "jest/globals": true,
  },
  extends: [
    "airbnb-base",
    "airbnb-typescript/base",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    project: "./tsconfig.json",
  },
  plugins: [
    "@typescript-eslint",
    "jest",
  ],
  rules: {
    "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "default",
        format: ["camelCase"],
        leadingUnderscore: "allow",
      },
      {
        selector: "variable",
        format: ["camelCase", "PascalCase", "UPPER_CASE"],
        leadingUnderscore: "allow",
      },
      {
        selector: "variable",
        types: ["boolean", "number", "string", "array"],
        format: ["camelCase", "UPPER_CASE"],
        leadingUnderscore: "allow",
      },
      {
        selector: "typeLike",
        format: ["PascalCase"],
      },
      {
        selector: "enumMember",
        format: ["PascalCase", "UPPER_CASE"],
      },
      {
        selector: ["function"],
        format: ["PascalCase", "camelCase"],
      },
      {
        selector: ["objectLiteralProperty", "objectLiteralMethod"],
        format: null,
      },
    ],
    "@typescript-eslint/no-base-to-string": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-extra-non-null-assertion": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-unnecessary-condition": [
      "error",
      { allowConstantLoopConditions: true },
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-use-before-define": [
      "error",
      {
        classes: false,
        functions: false,
      },
    ],
    "@typescript-eslint/prefer-interface": "off",
    "@typescript-eslint/prefer-nullish-coalescing": ["warn"],
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/prefer-string-starts-ends-with": "error",
    "@typescript-eslint/promise-function-async": "error",
    "max-classes-per-file": "off",
    "import/prefer-default-export": "off",
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
    "no-sequences": "error",
    "no-underscore-dangle": "off",
    "no-use-before-define": ["error", { classes: false, functions: false }],
    "arrow-body-style": [
      "error",
      "as-needed",
      { requireReturnForObjectLiteral: true },
    ],
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  overrides: [
    {
      files: ["*test.ts?(x)"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
