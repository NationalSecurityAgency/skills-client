// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('before:browser:launch', (browser = {}, args) => {
    cy.log('launching browser:', browser)
    if (browser.name === 'chrome') {
      args = args.concat('--auto-open-devtools-for-tabs');
    } else if (browser.name === 'electron') {
      // Cypress-specific option (state)
      args.devTools = true;
    }
    return args;
  });
}
