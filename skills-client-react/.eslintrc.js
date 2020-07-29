// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  settings: {
    react: {
      version: "detect"
    }
  },

  parserOptions: {
    parser: 'babel-eslint',
    ecmaFeatures: {
      jsx: true
    }
  },

  env: {
    browser: true,
    node: true,
  },

  extends: ['airbnb-base', 'plugin:react-hooks/recommended', 'plugin:react/recommended'],

  plugins: [
    'react-hooks',
    'react'
  ],

  ignorePatterns: ["**/*.test.js"],

  // check if imports actually resolve
  // add your custom rules here
  rules: {
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
      },
    ],
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: [
          'state',
          'acc',
          'e',
        ],
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        optionalDependencies: [
          'test/unit/index.js',
        ],
      },
    ],
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'max-len': [
      'error',
      {
        code: 300,
      },
    ],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
};

