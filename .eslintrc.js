/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['expo'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/mocks/**'],
            message:
              'Import from "__fixtures__" instead of "mocks". Fixture data lives under __fixtures__/.',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      // Allow __fixtures__ and __tests__ files to import from anywhere they need
      files: ['**/__tests__/**', '**/__fixtures__/**', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
  ],
};
