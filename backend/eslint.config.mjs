import eslint from '@eslint/js';
import github from 'eslint-plugin-github';
import { importX } from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import noLoopsPlugin from 'eslint-plugin-no-loops';
import pluginSecurity from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.strict,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  tseslint.configs.stylisticTypeChecked,
  github.getFlatConfigs().recommended,
  pluginSecurity.configs.recommended,
  eslintPluginUnicorn.configs['flat/recommended'],
  sonarjs.configs.recommended,
  {
    plugins: {
      'import-x': importX,
      'unused-imports': unusedImports,
      'no-loops': noLoopsPlugin,
    },
  },
  {
    rules: {
      'import/extensions': 'off',
      strict: 'error',
      'importPlugin/extensions': 'off',
      'no-unused-vars': 'off',
      'unicorn/no-null': 'off',
      camelcase: 'off',
      'import-x/no-named-as-default-member': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      curly: 'error',
      'no-shadow': 'error',
      '@typescript-eslint/no-shadow': 'error',
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      'no-useless-escape': 'error',
      'no-restricted-syntax': 'error',
      'no-confusing-arrow': 'error',
      'no-return-assign': 'error',
      eqeqeq: 'error',
      'dot-notation': 'error',
      'array-callback-return': 'error',
      'no-await-in-loop': 'error',
      'prefer-template': 'error',
      'prefer-object-spread': 'error',
      'no-console': 'error',
      'no-param-reassign': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-multiple-empty-lines': 'error',
      'github/array-foreach': 'error',
      'github/async-preventdefault': 'warn',
      'github/no-then': 'error',
      'github/no-blur': 'error',
      'no-loops/no-loops': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  {
    ignores: ['eslint.config.mjs', 'prettier.config.js'],
  },
  {
    files: ['./src/**/*.ts'],
    settings: {
      'import-x/resolver-next': createTypeScriptImportResolver({
        node: {
          extensions: ['.ts', '.jsx', '.tsx', '.json'],
        },
        alwaysTryTypes: true,
        project: './tsconfig.json',
      }),
    },
  },

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        Express: true,
      },
    },
  },
);
