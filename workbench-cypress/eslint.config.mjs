import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import cypress from 'eslint-plugin-cypress';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // Global ignores
  {
    ignores: ['node_modules/**', 'dist/**', 'cypress.config.ts', 'eslint.config.mjs'],
  },
  js.configs.recommended,
  {
    files: ['cypress/**/*.{js,ts}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        cy: 'readonly',
        Cypress: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly',
        context: 'readonly',
        setTimeout: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'import': importPlugin,
      'cypress': cypress,
    },
    rules: {
      // Base JavaScript recommended rules
      ...js.configs.recommended.rules,
      
      // TypeScript ESLint recommended rules
      ...tseslint.configs.recommended.rules,
      
      // Import plugin rules (mimicking airbnb-base behavior)
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-absolute-path': 'error',
      'import/no-self-import': 'error',
      'import/no-cycle': 'error',
      'import/no-useless-path-segments': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      
      // Custom rules from the original config
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
        },
        {
          selector: ['typeLike', 'enumMember'],
          format: ['PascalCase'],
        },
        {
          selector: ['objectLiteralProperty'],
          format: null,
        },
      ],
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          classes: false,
          functions: false,
        },
      ],
      '@typescript-eslint/prefer-interface': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': ['warn'],
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      
      // Import rules
      'import/prefer-default-export': 'off',
      
      // Base JavaScript rules
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      'no-sequences': 'error',
      'no-underscore-dangle': 'off',
      'no-use-before-define': ['error', { classes: false, functions: false }],
      
      // Cypress rules
      'cypress/no-unnecessary-waiting': 'warn',
      
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          paths: ['cypress'],
        },
      },
    },
  },
  // Prettier config to disable formatting rules
  eslintConfigPrettier,
];