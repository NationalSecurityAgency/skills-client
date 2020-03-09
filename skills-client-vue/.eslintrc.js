module.exports = {
  extends: [
    'plugin:vue/recommended'
  ],
  "globals": {
    Vue: 'readonly',
    window: 'readonly',
  },
  "rules": {
    "no-multiple-empty-lines": [1, { "max": 1 }],
    "vue/html-closing-bracket-newline": 0,
  },
};
