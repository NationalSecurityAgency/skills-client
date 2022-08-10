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

const homePage = '/native/index.html'

context("Native JS Tests", () => {

    const laterThan_1_4_0 = Utils.skillsServiceVersionLaterThan('1.4.0');
    const laterThan_1_11_1 = Utils.skillsServiceVersionLaterThan('1.11.1');
    const noThemeBackground = laterThan_1_4_0 ? 'rgba(0, 0, 0, 0)' : 'rgb(255, 255, 255)';
    const rankDetailsTitle = laterThan_1_11_1 ? 'My Rank' : 'Rank Overview'

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

    it("skill display", () => {
        cy.createDefaultTinyProject();
        cy.intercept(Cypress.env('tokenUrl'))
            .as("getToken");
        cy.backendPost("/api/projects/proj1/skills/Thor", {
            userId: Cypress.env('proxyUser'),
            timestamp: Date.now()
        });
        cy.visit("/native/clientDisplay.html");
        
        cy.wrapIframe().contains('My Level')
        cy.wrapIframe().contains('50 Points earned Today')
        cy.wrapIframe().contains('Subject 0')

        // verify that there is no background set
        // cypress always validates against rgb
        cy.wrapIframe().find('.skills-page-title-text-color')
            .should('have.css', 'background-color').and('equal', noThemeBackground);
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

        // verify that there is no background set
        // cypress always validates against rgb
        cy.wrapIframe().find('.skills-page-title-text-color')
            .should('have.css', 'background-color').and('equal', noThemeBackground);
    });

    it("skill display - summary only", () => {
        cy.createDefaultTinyProject();
        cy.intercept(Cypress.env('tokenUrl'))
            .as("getToken");
        cy.backendPost("/api/projects/proj1/skills/Thor", {
            userId: Cypress.env('proxyUser'),
            timestamp: Date.now()
        });
        cy.visit("/native/clientDisplay.html?isSummaryOnly=true");

        
        cy.wrapIframe().contains('My Level')
        cy.wrapIframe().contains('50 Points earned Today')
        cy.wrapIframe().contains('Subject 0').should('not.exist')

        // verify that there is no background set
        // cypress always validates against rgb
        cy.wrapIframe().find('.skills-page-title-text-color')
            .should('have.css', 'background-color').and('equal', noThemeBackground);
    });

    it("skill display - theme", () => {
        cy.createDefaultTinyProject();
        cy.intercept(Cypress.env('tokenUrl'))
            .as("getToken");
        cy.backendPost("/api/projects/proj1/skills/Thor", {
            userId: Cypress.env('proxyUser'),
            timestamp: Date.now()
        });
        cy.visit("/native/clientDisplay.html?themeName=Dark Blue");
        cy.wait("@getToken");
        
        cy.wrapIframe().contains('My Level')
        cy.wrapIframe().contains('50 Points earned Today')
        cy.wrapIframe().contains('Subject 0')

        // verify dark blue background of hex #152E4d
        // cypress always validates against rgb
        cy.wrapIframe().find('.skills-page-title-text-color')
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
        cy.wrapIframe().contains('Subject 0').should('not.exist')

        // verify dark blue background of hex #152E4d
        // cypress always validates against rgb
        cy.wrapIframe().find('.skills-page-title-text-color')
            .should('have.css', 'background-color').and('equal', 'rgb(21, 46, 77)');
    });

    it('client display should display an error if skills service is down', () => {
        cy.createDefaultTinyProject()
        cy.intercept('/public/status',
        {
            statusCode: 503, // server is down
            body: {}
        }).as('getStatus')
        cy.visit('/native/clientDisplay.html');
        cy.wait('@getStatus')

        cy.contains("Could NOT reach Skilltree Service");
    });

    it("only display skills up-to the provided version", () => {
        const noVersionPoints = 'Earn up to 200 points';
        const v1Points = 'Earn up to 150 points';
        const v0Points = 'Earn up to 100 points';
        cy.createDefaultTinyProject();
        cy.intercept(Cypress.env('tokenUrl'))
            .as("getToken");
        cy.backendAddSkill("skillv1", 1);
        cy.backendAddSkill("skillv2", 2);
        cy.visit("/native/clientDisplay.html");
        cy.wait("@getToken");
        cy.wait('@getToken')
        cy.wrapIframe().contains(noVersionPoints);

        // cy.visit("/native/index.html");
        cy.visit("/native/clientDisplay.html?skillsVersion=1");
        cy.wait('@getToken')
        cy.wrapIframe().contains(v1Points);

        // cy.visit("/native/index.html");
        cy.visit("/native/clientDisplay.html?skillsVersion=0");
        cy.wait('@getToken')
        cy.wrapIframe().contains(v0Points);
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
        cy.visitHomePage(homePage);
        cy.contains('Level 1')
    })

    if (Utils.skillsServiceVersionLaterThan('1.5.0')) {
        it('internal back button when when returning from an external page', () => {
            cy.createDefaultTinyProject()
            cy.intercept(Cypress.env('tokenUrl')).as('getToken')
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

            // visit client display
            cy.visit('/native/clientDisplay.html?internalBackButton=true');
            // cy.wait('@getToken')

            cy.clientDisplay(true).find('[data-cy=back]').should('not.exist');
            cy.clientDisplay().contains('User Skills');

            // navigate to Rank Overview that contains the back button
            cy.clientDisplay().find('[data-cy=myRank]').click();
            cy.clientDisplay().contains(rankDetailsTitle);
            cy.clientDisplay().find('[data-cy=back]').should('exist');

            // now visit the "Report Skills" (external) page
            cy.get('[data-cy=reportSkillsLink]').click()
            cy.contains('Report Skills Examples');

            // switch back to the the client display
            cy.get('[data-cy=userDisplayLink]').click()
        });

        it('internal back button when when returning from an external page - multiple layers deep', () => {
            cy.createDefaultTinyProject()
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

            // visit client display
            cy.visit('/native/clientDisplay.html?internalBackButton=true');

            cy.clientDisplay().find('[data-cy=back]').should('not.exist');
            cy.clientDisplay().contains('User Skills');

            // to subject page
            cy.cdClickSubj(0, 'Subject 0');

            // navigate to Rank Overview that contains the back button
            cy.clientDisplay().find('[data-cy=myRank]').click();
            cy.clientDisplay().contains(rankDetailsTitle);
            cy.clientDisplay().find('[data-cy=back]').should('exist');

            // click the back button and verify that we are still in the
            // client display (Subject page)
            cy.cdBack('Subject 0');

            // then back one more time and we should be back on the client display home page
            cy.cdBack('User Skills');
        });

        it('browser back button works correctly when internal back button is not present', () => {
            cy.createDefaultTinyProject()
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

            // visit client display
            cy.visit("/native/clientDisplay.html?internalBackButton=false");

            cy.clientDisplay().find('[data-cy=back]').should('not.exist');
            cy.clientDisplay().contains('User Skills');

            // to subject page
            cy.cdClickSubj(0, 'Subject 0');

            // navigate to Rank Overview and that it does NOT contains the internal back button
            cy.clientDisplay().find('[data-cy=myRank]').click();
            cy.clientDisplay().contains(rankDetailsTitle);
            cy.clientDisplay().find('[data-cy=back]').should('not.exist');

            // click the browser back button and verify that we are still in the
            // client display (Subject page)
            cy.go('back')  // browser back button
            cy.clientDisplay().contains('Subject 0');

            // then back one more time and we should be back on the client display home page
            cy.go('back')  // browser back button
            cy.clientDisplay().contains('User Skills');
        });

        it('deep link and reload', () => {
            cy.createDefaultTinyProject()
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

            // navigate to Rank Overview via direct link
            cy.visit('/native/clientDisplay.html?skillsClientDisplayPath=%2Frank#/showSkills');
            cy.clientDisplay().contains(rankDetailsTitle);

            // reload and confirm we are still on Rank Overview page
            cy.reload();
            cy.clientDisplay().contains(rankDetailsTitle);
        });

        it('back button after reload', () => {
            cy.createDefaultTinyProject()
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

            // visit client display
            cy.visit("/native/clientDisplay.html?internalBackButton=false");

            cy.clientDisplay().find('[data-cy=back]').should('not.exist');
            cy.clientDisplay().contains('User Skills');

            // to subject page
            cy.cdClickSubj(0, 'Subject 0');

            // navigate to Rank Overview and that it does NOT contains the internal back button
            cy.clientDisplay().find('[data-cy=myRank]').click();
            cy.clientDisplay().contains(rankDetailsTitle);
            cy.clientDisplay().find('[data-cy=back]').should('not.exist');

            cy.reload();
            cy.clientDisplay().contains(rankDetailsTitle);

            // click the browser back button and verify that we are still in the
            // client display (Subject page)
            cy.go('back')  // browser back button
            cy.clientDisplay().contains('Subject 0');

            // then back one more time and we should be back on the client display home page
            cy.go('back')  // browser back button
            cy.clientDisplay().contains('User Skills');
        });

        it('route change is passed to the client app', () => {
            cy.createDefaultTinyProject()
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

            // visit client display
            cy.visit('/native/clientDisplay.html?internalBackButton=true');
            cy.get('[data-cy=skillsDisplayPath]').contains('Skills Display Path: [/]');

            // to subject page
            cy.cdClickSubj(0, 'Subject 0');
            cy.get('[data-cy=skillsDisplayPath]').contains('Skills Display Path: [/subjects/subj0]');

            // navigate to Rank Overview and that it does NOT contains the internal back button
            cy.clientDisplay().find('[data-cy=myRank]').click();
            cy.clientDisplay().contains(rankDetailsTitle);

            cy.get('[data-cy=skillsDisplayPath]').contains('Skills Display Path: [/subjects/subj0/rank]');
        });

    }

    if (Utils.skillsServiceVersionLaterThan('1.6.0')) {
        it('navigate skills-display programatically', () => {
            cy.createDefaultTinyProject()
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

            // visit client display
            cy.visit('/native/clientDisplay.html?internalBackButton=true');
            cy.get('[data-cy=skillsDisplayPath]').contains('Skills Display Path: [/]');

            // to subject page
            cy.get('[data-cy=navigateButton]').click();
            cy.get('[data-cy=skillsDisplayPath]').contains('Skills Display Path: [/subjects/subj0]');
        });
    }
});
