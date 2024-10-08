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
import Utils from "./Utils";
import selectors from "../support/selectors";

const homePage = '/native/index.html'

context("Skills Display Tests", () => {

    it("skill display", () => {
        cy.createDefaultTinyProject();
        cy.intercept(Cypress.env('tokenUrl'))
            .as("getToken");
        cy.backendPost("/api/projects/proj1/skills/Thor", {
            userId: Cypress.env('proxyUser'),
            timestamp: Date.now()
        });
        cy.visitSkillsDisplay();
        
        cy.wrapIframe().contains('My Level')
        cy.wrapIframe().contains('50 Points earned Today')
        cy.wrapIframe().contains('Subject 0')

        // verify that there is no background set
        // cypress always validates against rgb
        cy.wrapIframe().find('[data-cy="skillsTitle"]')
            .should('have.css', 'background-color').and('equal', Utils.noThemeBackground());
    });

    it("skill display - default options", () => {
        cy.createDefaultTinyProject();
        cy.intercept(Cypress.env('tokenUrl'))
            .as("getToken");
        cy.backendPost("/api/projects/proj1/skills/Thor", {
            userId: Cypress.env('proxyUser'),
            timestamp: Date.now()
        });
        cy.visit("/native/clientDisplayDefaultOptions.html");

        
        cy.wrapIframe().contains('My Level')
        cy.wrapIframe().contains('50 Points earned Today')
        cy.wrapIframe().contains('Subject 0')
        cy.wrapIframe().find(selectors.firstSubjectTileBtn)

        // verify that there is no background set
        // cypress always validates against rgb
        cy.wrapIframe().find('[data-cy="skillsTitle"]')
            .should('have.css', 'background-color').and('equal', Utils.noThemeBackground());
    });

    it("skill display - summary only", () => {
        cy.createDefaultTinyProject();
        cy.intercept(Cypress.env('tokenUrl'))
            .as("getToken");
        cy.backendPost("/api/projects/proj1/skills/Thor", {
            userId: Cypress.env('proxyUser'),
            timestamp: Date.now()
        });
        cy.visitSkillsDisplay("?isSummaryOnly=true");

        
        cy.wrapIframe().contains('My Level')
        cy.wrapIframe().contains('50 Points earned Today')
        cy.wrapIframe().find('[data-cy="subjectTile-subj0"] [data-cy="subjectTileBtn"]').should('not.exist')

        // verify that there is no background set
        // cypress always validates against rgb
        cy.wrapIframe().find('[data-cy="skillsTitle"]')
            .should('have.css', 'background-color').and('equal', Utils.noThemeBackground());
    });

    it("skill display - theme", () => {
        cy.createDefaultTinyProject();
        cy.intercept(Cypress.env('tokenUrl'))
            .as("getToken");
        cy.backendPost("/api/projects/proj1/skills/Thor", {
            userId: Cypress.env('proxyUser'),
            timestamp: Date.now()
        });
        cy.visitSkillsDisplay("?themeName=Dark Blue");
        cy.wait("@getToken");
        
        cy.wrapIframe().contains('My Level')
        cy.wrapIframe().contains('50 Points earned Today')
        cy.wrapIframe().contains('Subject 0')

        // verify dark blue background of hex #152E4d
        // cypress always validates against rgb
        cy.wrapIframe().find('[data-cy="skillsTitle"]')
            .should('have.css', 'background-color').and('equal', 'rgb(21, 46, 77)');
    });

    it("skill display - summary only - theme", () => {
        cy.createDefaultTinyProject();
        cy.intercept(Cypress.env('tokenUrl'))
            .as("getToken");
        cy.backendPost("/api/projects/proj1/skills/Thor", {
            userId: Cypress.env('proxyUser'),
            timestamp: Date.now()
        });
        cy.visit(
            "/native/clientDisplay.html?themeName=Dark Blue&isSummaryOnly=true"
        );
        
        cy.wrapIframe().contains('My Level')
        cy.wrapIframe().contains('50 Points earned Today')
        cy.wrapIframe().find('[data-cy="subjectTile-subj0"] [data-cy="subjectTileBtn"]').should('not.exist')

        // verify dark blue background of hex #152E4d
        // cypress always validates against rgb
        cy.wrapIframe().find('[data-cy="skillsTitle"]')
            .should('have.css', 'background-color').and('equal', 'rgb(21, 46, 77)');
    });

    it('client display should display an error if skills service is down', () => {
        cy.onlyOn(Utils.skillsClientJSVersionLaterThan('3.2.0'))
        cy.createDefaultTinyProject()
        cy.intercept('/public/status',
        {
            statusCode: 503, // server is down
            body: {}
        }).as('getStatus')
        cy.visitSkillsDisplay();
        cy.wait('@getStatus')

        cy.contains("Could NOT reach Skilltree Service");
    });

    it("only display skills up-to the provided version", () => {
        const totalPointsSelector = '[data-cy="totalPoints"]'
        cy.createDefaultTinyProject();
        cy.intercept(Cypress.env('tokenUrl'))
            .as("getToken");
        cy.backendAddSkill("skillv1", 1);
        cy.backendAddSkill("skillv2", 2);
        cy.visitSkillsDisplay();
        cy.wait("@getToken");
        cy.wait('@getToken')
        const validateTotalPoints = (expectedPoints) => {
            if (Utils.skillsServiceVersionLaterThan('3.0.0')){
                cy.wrapIframe().find(totalPointsSelector).should('have.text', `${expectedPoints}`);
            } else {
                cy.wrapIframe().find('.user-skills-overview').contains(`Earn up to ${expectedPoints} points`)
            }
        }
        validateTotalPoints(200)

        cy.visitSkillsDisplay("?skillsVersion=1");
        cy.wait('@getToken')
        validateTotalPoints(150)

        cy.visitSkillsDisplay("?skillsVersion=0");
        cy.wait('@getToken')
        validateTotalPoints(100)
    });

    it('skillsClientVersion is reported correctly', () => {
        cy.createDefaultProject()
        cy.intercept('POST', '/api/projects/proj1/skillsClientVersion', (req) => {
            expect(req.body).to.have.property('skillsClientVersion').and.to.contain('@skilltree/skills-client-js-')
            req.reply((res) => {
                expect(res.statusCode).to.eq(200)
                expect(res.body).to.have.property('success').to.eq(true)
            })
        }).as('reportClientVersion')

        cy.visit('/native/index.html')
        cy.wait('@reportClientVersion')
    })

    it('level component should be reactive', () => {
        cy.createDefaultProject()
        const sendEventViaDropdownId = "#exampleDirectiveClickEvent";
        Cypress.Commands.add("clickSubmit", () => {
            cy.get(`${sendEventViaDropdownId} .btn`).click();
        });

        cy.visitHomePage(homePage);
        cy.contains('Level 0')

        cy.clickSubmit();
        cy.contains('Level 1')
    })

    it('level component should load initial level', () => {
        cy.createDefaultProject()

        // this will increment levels for skills@skills.org but Level and display components display data for the proxyUser
        // validate that level is still 0
        cy.reportSkillForUser('subj1_skill0', 'skills@skill.org')
        cy.visitHomePage(homePage);
        cy.contains('Level 0')

        cy.reportSkillForUser('subj1_skill0', Cypress.env('proxyUser'))
        // cy.visitHomePage(homePage);
        cy.contains('Level 1')
    })

});
