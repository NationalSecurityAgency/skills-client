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
import Utils from "./Utils";
import selectors from "../support/selectors";

context("Configuration Disabled Tests", () => {

    it('export user transcript', () => {
        cy.onlyOn(Utils.skillsClientJSVersionLaterThan('3.6.0'))
        cy.createDefaultTinyProject('proj1')

        // visit client display
        cy.intercept('**/public/status', cy.spy().as('getStatus'))
        cy.intercept('POST', '**/api/projects/proj1/skillsClientVersion', cy.spy().as('reportClientVersion'))
        cy.intercept('**/api/projects/proj1/level', cy.spy().as('getLevel'))
        cy.intercept('**/skills-websocket/info**', cy.spy().as('initWebsockets'))

        cy.intercept('POST', '** /api/projects/proj1/skills/someId', cy.spy().as('reportSkillId'))
        cy.intercept('/api/projects/proj1/summary', cy.spy().as('getProjSummary'))

        cy.visit('/native/disabledConfig.html');
        cy.wait(5000)
        cy.get('@getStatus').should('not.have.been.called');
        cy.get('@reportClientVersion').should('not.have.been.called');
        cy.get('@getLevel').should('not.have.been.called');
        cy.get('@initWebsockets').should('not.have.been.called');
        cy.get('[data-cy="levelComponentRes"]').contains('Level: []')

        cy.get('[data-cy="skillsDisplayRes"] #skills-client-display').should('be.empty')
        cy.get('@getProjSummary').should('not.have.been.called');

        cy.get('[data-cy="reportSkillButton"]').click()
        cy.wait(3000)
        cy.get('@reportSkillId').should('not.have.been.called');
    });
});
