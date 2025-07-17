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

const homePage = '/native/index.html'

context("Global Events Tests", () => {

    it("global event show correct results", () => {
        cy.createDefaultProject();

        const sendEventViaDropdownId = "#exampleDirectiveClickEvent";
        Cypress.Commands.add("clickSubmit", () => {
            cy.get(`${sendEventViaDropdownId} .btn`).click();
        });

        cy.visitHomePage(homePage);
        cy.clickSubmit();

        cy.get('pre[data-cy=globalEventResult]').contains('"skillId": "IronMan"')
        cy.get('pre[data-cy=globalEventResult]').contains('"pointsEarned": 50')
        cy.get('pre[data-cy=globalEventResult]').contains('"skillApplied": true')
        cy.get('pre[data-cy=globalEventResult]').contains(/completed": [[][^]*"type": "Overall",[^]\s*"level": 1/)
    });
    it("global event show correct results (skills reported directly to backend endpoint)", () => {
        cy.createDefaultProject();

        cy.visitHomePage(homePage);
        cy.reportSkillForUser("IronMan", Cypress.env('proxyUser'));

        cy.get('pre[data-cy=globalEventResult]').should('be.visible')
        cy.get('pre[data-cy=globalEventResult]').contains('"skillId": "IronMan"')
        cy.get('pre[data-cy=globalEventResult]').contains('"pointsEarned": 50')
        cy.get('pre[data-cy=globalEventResult]').contains('"skillApplied": true')
        cy.get('pre[data-cy=globalEventResult]').contains(/completed": [[][^]*"type": "Overall",[^]\s*"level": 1/)
    });

    it('global event does not update when skill reported for a different project', () => {
        cy.createDefaultProject()
        cy.createDefaultTinyProject('proj2')

        cy.visitHomePage(homePage);
        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'), 'proj2')

        cy.get('pre[data-cy=globalEventResult]').should('be.empty');
    })
    it('global event is not reported when skill is not applied (skill reported directly to backend endpoint)', () => {
        cy.createDefaultProject()
        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'))

        cy.visitHomePage(homePage);
        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'))

        cy.get('[data-cy=globalEventResult]').should('be.empty');
    })
    it('global event is not reported when skill is not applied', () => {
        cy.createDefaultProject()
        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'))

        cy.visitHomePage(homePage);
        const sendEventViaDropdownId = "#exampleDirectiveClickEvent";
        Cypress.Commands.add("clickSubmit", () => {
            cy.get(`${sendEventViaDropdownId} .btn`).click();
        });
        cy.get('[type="checkbox"]').uncheck()
        cy.clickSubmit()

        cy.get('pre[data-cy=globalEventResult]').should('be.empty');
    })

    it('global event is reported even when skill is not applied when notifyIfSkillNotApplied=true ', () => {
        cy.createDefaultProject()
        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'))

        const sendEventViaDropdownId = "#exampleDirectiveClickEvent";
        Cypress.Commands.add("clickSubmit", () => {
            cy.get(`${sendEventViaDropdownId} .btn`).click();
        });

        cy.visitHomePage(homePage);
        cy.get('[type="checkbox"]').check()
        cy.clickSubmit()

        cy.get('pre[data-cy=globalEventResult]').contains('"skillId": "IronMan"')
        cy.get('pre[data-cy=globalEventResult]').contains('"pointsEarned": 0')
        cy.get('pre[data-cy=globalEventResult]').contains('"skillApplied": false')
        cy.get('pre[data-cy=globalEventResult]').contains('"explanation": "This skill reached its maximum points"')
    })


});
