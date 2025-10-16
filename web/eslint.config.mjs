import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jestPlugin from "eslint-plugin-jest";
import jestDomPlugin from "eslint-plugin-jest-dom";
import testingLibraryPlugin from "eslint-plugin-testing-library";
import importPlugin from "eslint-plugin-import";
import cssModulesPlugin from "eslint-plugin-css-modules";
import prettierConfig from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    ignores: [
      "renderer/.next/**",
      "renderer/gen/**",
      "renderer/postcss.config.js",
      "dist/**",
      "app/**",
      "build/**",
      "node_modules/**",
      "*.config.js",
      "*.config.mjs",
      "renderer/*.config.js",
      "renderer/*.config.mjs",
      "main/preload.d.ts",
      ".next/**",
      "build/**",
      "src-tauri/**",
    ],
  },
  {
    files: ["renderer/**/*.{js,jsx,ts,tsx}", "main/**/*.{js,jsx,ts,tsx}"],
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
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        fetch: "readonly",
        React: "readonly",
        JSX: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        Diff: "readonly",
        // Node globals
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
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
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      jest: jestPlugin,
      "jest-dom": jestDomPlugin,
      "testing-library": testingLibraryPlugin,
      import: importPlugin,
      "css-modules": cssModulesPlugin,
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
      next: {
        rootDir: "renderer",
      },
      react: {
        version: "detect",
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
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "no-unused-vars": "off",
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

      // React rules
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
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",

      // React Hooks rules
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",

      // CSS Modules rules
      "css-modules/no-unused-class": "warn",

      // Import rules
      "import/prefer-default-export": "off",

      // General rules
      "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
      "no-sequences": "error",
      "no-underscore-dangle": "off",
      "no-use-before-define": ["error", { classes: false, functions: false }],
      "arrow-body-style": [
        "error",
        "as-needed",
        { requireReturnForObjectLiteral: true },
      ],

      // Testing Library rules
      "testing-library/no-node-access": [
        "error",
        { allowContainerFirstChild: true },
      ],
    },
  },
  {
    files: ["**/*.js", "**/*.jsx", "**/*test.ts", "**/*test.tsx"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  prettierConfig,
];
