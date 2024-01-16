/*
 * Copyright 2020 SkillTree
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')


beforeEach(() => {
  // first call to npm fails, looks like this may be the bug: https://github.com/cypress-io/cypress/issues/6081
  cy.exec('npm version', { failOnNonZeroExit: false })
  cy.exec('npm run backend:resetDb')

  cy.fixture('vars.json').then((vars) => {
    cy.request('api/config').then(resp => {
      cy.backendRegister(vars.rootUser, vars.defaultPass, true);
      cy.backendRegister(vars.defaultUser, vars.defaultPass);  // used by the skills-int-service app
      const oauthMode = resp.body.authenticator === 'hydra' || resp.body.authenticator === 'http://localhost:8080/oauth2/authorization/hydra'
      Cypress.env('oauthMode', oauthMode)
      if (!oauthMode) {
        cy.backendLogin(vars.defaultUser, vars.defaultPass);
        Cypress.env('proxyUser', 'user1')
        Cypress.env('tokenUrl', '/api/users/user1/token')
      } else {
        cy.loginBySingleSignOn()
        Cypress.env('proxyUser', 'foo-hydra')
        Cypress.env('tokenUrl', 'http://localhost:8080/api/projects/proj1/token')
      }
    });
  })
})

afterEach(() => {
  cy.skillsLog(`Completed test [${Cypress.mocha.getRunner().test.title}]`)
})
