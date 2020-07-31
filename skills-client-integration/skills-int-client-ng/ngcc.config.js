module.exports = {
  packages: {
    '@skilltree/skills-client-ng':  {
      ignorableDeepImportMatchers: [
        /lodash\//
      ]
    },
    'ngx-highlightjs':  {
      ignorableDeepImportMatchers: [
        /highlight/
      ]
    },
  }
};