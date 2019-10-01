module.exports = {
  "extends": "airbnb-base",
  "rules": {
    "no-underscore-dangle": 0,
    "max-len": ["error", {'code': 200}],
  },
  "globals": {
    "XMLHttpRequest": 'readonly',
    "document": 'readonly',
    "alert": 'readonly',
  },
};
