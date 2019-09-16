module.exports = {
  extends: [
    'plugin:vue/recommended'
  ],
  "globals": {
    Vue: 1,
    window: 1,
  },
  "rules": {
    "no-multiple-empty-lines": [1, { "max": 1 }],
    "vue/html-closing-bracket-newline": 0,
  },
};
