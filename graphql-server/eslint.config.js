const js = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const jestPlugin = require("eslint-plugin-jest");
const importPlugin = require("eslint-plugin-import");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  js.configs.recommended,
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "*.config.js",
      ".eslintrc.js",
      "check-server.js",
    ],
  },
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        // Node globals
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        console: "readonly",
        // Jest globals
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      jest: jestPlugin,
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      // ESLint base rules
      ...js.configs.recommended.rules,
      
      // TypeScript rules
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

      // Import rules
      "import/prefer-default-export": "off",

      // General rules
      "max-classes-per-file": "off",
      "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
      "no-sequences": "error",
      "no-underscore-dangle": "off",
      "no-unused-vars": "off", // Disabled in favor of @typescript-eslint/no-unused-vars
      "no-dupe-args": "off", // Allow duplicate parameter names for unused parameters
      "no-redeclare": "off", // Allow redeclared underscore parameters
      "no-use-before-define": ["error", { classes: false, functions: false }],
      "arrow-body-style": [
        "error",
        "as-needed",
        { requireReturnForObjectLiteral: true },
      ],
    },
  },
  {
    files: ["**/*test.ts", "**/*test.tsx"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  prettierConfig,
];