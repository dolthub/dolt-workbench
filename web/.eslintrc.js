module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    project: "./tsconfig.json",
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  env: {
    browser: true,
    node: true,
    "jest/globals": true,
  },
  extends: [
    "airbnb",
    "airbnb-typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier",
    "plugin:jest-dom/recommended",
    "plugin:testing-library/dom",
    "plugin:react/jsx-runtime",
    "plugin:css-modules/recommended",
    "plugin:@next/next/recommended",
  ],
  plugins: [
    "@typescript-eslint",
    "jest",
    "jest-dom",
    "testing-library",
    "react",
    "react-hooks",
    "css-modules",
  ],
  rules: {
    "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/naming-convention": [
      "error",
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
    "css-modules/no-unused-class": "warn",
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
    "jsx-a11y/control-has-associated-label": "warn",
    "jsx-a11y/anchor-is-valid": "off",
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react/destructuring-assignment": "off",
    "react/jsx-curly-brace-presence": [
      "error",
      { children: "ignore", props: "never" },
    ],
    "react/jsx-no-constructed-context-values": "warn",
    "react/jsx-filename-extension": "off",
    "react/jsx-props-no-spreading": "off",
    "react/state-in-constructor": ["error", "never"],
    "react/require-default-props": "off",
    "react/no-unused-prop-types": "error",
    "react/prop-types": "off",
    "react/function-component-definition": [
      2,
      { namedComponents: ["function-declaration", "arrow-function"] },
    ],
    "testing-library/no-node-access": [
      "error",
      { allowContainerFirstChild: true },
    ],
  },
  overrides: [
    {
      files: ["*.js?(x)", "*test.ts?(x)"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
