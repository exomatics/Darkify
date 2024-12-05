import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import github from 'eslint-plugin-github';
import sonarjs from 'eslint-plugin-sonarjs';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import noLoopsPlugin from 'eslint-plugin-no-loops';
import pluginSecurity from 'eslint-plugin-security';

/** @type {import('eslint').Linter.Config[]} */
export default [
  github.getFlatConfigs().recommended,
  pluginSecurity.configs.recommended,
  sonarjs.configs.recommended,
  eslintPluginUnicorn.configs['flat/recommended'],
  ...github.getFlatConfigs().typescript,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    rules: {
      strict: 'error',
      'no-unused-vars': 'off',
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
    plugins: {
      import: pluginImport,
      'unused-imports': unusedImports,
      'no-loops': noLoopsPlugin,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
        },
      },
    },
  },

  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
];
