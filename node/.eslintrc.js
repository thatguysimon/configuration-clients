module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
      'airbnb-typescript/base', // Uses the recommended rules from airbnb translated for ts
      'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
      'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
      'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
      'plugin:jest/recommended',
  ],
  parserOptions: {
      ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports
      project: './tsconfig.json',
  },

  rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/member-naming': [
          'error',
          {
              private: '^__',
              protected: '^_',
          },
      ],
      'jest/no-disabled-tests': 'off',
      'no-underscore-dangle': 'off',
      'class-methods-use-this': 'off',
  },
  plugins: ['jest', 'prettier'],
  settings: {
      'import/resolver': {
          node: {
              extensions: ['.js', '.jsx', '.ts', '.tsx', '.test.ts'],
              moduleDirectory: ['node_modules', './display/node_modules'],
          },
      },
  },
};
