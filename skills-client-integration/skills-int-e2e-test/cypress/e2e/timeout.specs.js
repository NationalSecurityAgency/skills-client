/*
 * Copyright 2025 SkillTree
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

const homePage = '/native/index.html'

context("Token timeout JS Tests", () => {

  if (Cypress.env('timeout') === true || Cypress.env('timeout') === 'true') {
    it("report skill with expired token, retry checker will resend with new token", () => {
      cy.createDefaultProject();
      cy.intercept(Cypress.env('tokenUrl')).as("getToken");
      cy.visitHomePage(homePage);

      cy.wait("@getToken");
      cy.wait(71000)  // wait 71 seconds to ensure the token has expired
      cy.get('[data-cy="exampleDirectiveClickEventButton"]').click();

      cy.get('pre[data-cy=globalEventResult]').should('be.empty');

      cy.wait("@getToken", { timeout: 60000 }); // wait ~ another 50 seconds to all for the RetryChecker to resubmit

      cy.get('pre[data-cy=globalEventResult]').contains('"skillId": "IronMan"')
      cy.get('pre[data-cy=globalEventResult]').contains('"pointsEarned": 50')
      cy.get('pre[data-cy=globalEventResult]').contains('"skillApplied": true')
      cy.get('pre[data-cy=globalEventResult]').contains(/completed": [[][^]*"type": "Overall",[^]\s*"level": 1/)
    });

    it('skill display - navigate after token expires', () => {
      cy.createDefaultTinyProject()
      cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

      // visit client display
      cy.visit("/native/clientDisplay.html");

      cy.clientDisplay().contains('User Skills');

      // to subject page
      cy.wait(10000)  // wait 10 seconds to ensure the token has expired
      cy.cdClickSubj();
    });

  } else {

    it('timeout var not set, not tests to run', () => {
      cy.log(`timeout env var is not true [${Cypress.env('timeout')}], skipping test.`)
    });
  }
});