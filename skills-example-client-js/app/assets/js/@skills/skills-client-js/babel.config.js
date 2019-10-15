const presets = [
  [
    "@babel/env",
    {
      targets: {
        firefox: '15',
        chrome: '40',
      },
    },
  ],
];

module.exports = { presets };
