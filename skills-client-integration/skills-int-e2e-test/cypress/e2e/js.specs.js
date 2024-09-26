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

context("Native JS Tests", () => {

    const laterThan_3_1_0 = Utils.skillsServiceVersionLaterThan('3.1.0');
    const laterThan_1_4_0 = Utils.skillsServiceVersionLaterThan('1.4.0');
    const laterThan_1_11_1 = Utils.skillsServiceVersionLaterThan('1.11.1');
    const computeNoThemeBackground = () => {
        if (laterThan_3_1_0) {
            return 'rgb(255, 255, 255)'
        }
        return laterThan_1_4_0 ? 'rgba(0, 0, 0, 0)' : 'rgb(255, 255, 255)';
    }
    const noThemeBackground = computeNoThemeBackground()

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
        cy.wrapIframe().find('[data-cy="skillsTitle"]')
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
        cy.wrapIframe().find('[data-cy="subjectTile-subj0"] [data-cy="subjectTileBtn"]')

        // verify that there is no background set
        // cypress always validates against rgb
        cy.wrapIframe().find('[data-cy="skillsTitle"]')
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
        cy.wrapIframe().find('[data-cy="subjectTile-subj0"] [data-cy="subjectTileBtn"]').should('not.exist')

        // verify that there is no background set
        // cypress always validates against rgb
        cy.wrapIframe().find('[data-cy="skillsTitle"]')
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
        const totalPointsSelector = '[data-cy="totalPoints"]'
        cy.createDefaultTinyProject();
        cy.intercept(Cypress.env('tokenUrl'))
            .as("getToken");
        cy.backendAddSkill("skillv1", 1);
        cy.backendAddSkill("skillv2", 2);
        cy.visit("/native/clientDisplay.html");
        cy.wait("@getToken");
        cy.wait('@getToken')
        cy.wrapIframe().find(totalPointsSelector).should('have.text', '200');

        // cy.visit("/native/index.html");
        cy.visit("/native/clientDisplay.html?skillsVersion=1");
        cy.wait('@getToken')
        cy.wrapIframe().find(totalPointsSelector).should('have.text', '150');

        // cy.visit("/native/index.html");
        cy.visit("/native/clientDisplay.html?skillsVersion=0");
        cy.wait('@getToken')
        cy.wrapIframe().find(totalPointsSelector).should('have.text', '100');
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

    if (Utils.skillsServiceVersionLaterThan('1.5.0')) {
        it('internal back button when when returning from an external page', () => {
            cy.createDefaultTinyProject()
            cy.intercept(Cypress.env('tokenUrl')).as('getToken')
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

            // visit client display
            cy.visit('/native/clientDisplay.html?internalBackButton=true');
            // cy.wait('@getToken')

            // cy.clientDisplay(true)
            cy.wrapIframe().find(selectors.myRankButton)
            cy.wrapIframe().find(selectors.titleSection).find(selectors.backButton).should('not.exist')

            // navigate to Rank Overview that contains the back button
            cy.wrapIframe().find(selectors.myRankButton).click();
            cy.wrapIframe().find(selectors.titleSection).contains(rankDetailsTitle);
            cy.wrapIframe().find(selectors.titleSection).find(selectors.backButton).should('exist')

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

            cy.clientDisplay().find(selectors.myRankButton)
            cy.clientDisplay().find(selectors.titleSection).find(selectors.backButton).should('not.exist')

            // to subject page
            cy.cdClickSubj(0, 'Subject 0');

            // navigate to Rank Overview that contains the back button
            cy.clientDisplay().find(selectors.myRankButton).click();
            cy.clientDisplay().find(selectors.titleSection).contains(rankDetailsTitle);
            cy.clientDisplay().find(selectors.backButton).should('exist');

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

            cy.clientDisplay().find(selectors.myRankButton)
            cy.clientDisplay().find(selectors.titleSection).find(selectors.backButton).should('not.exist')

            // to subject page
            cy.cdClickSubj(0, 'Subject 0');

            // navigate to Rank Overview and that it does NOT contains the internal back button
            cy.clientDisplay().find(selectors.myRankButton).click()
            cy.clientDisplay().find(selectors.titleSection).contains(rankDetailsTitle);
            cy.clientDisplay().find(selectors.titleSection).find(selectors.backButton).should('not.exist')

            // click the browser back button and verify that we are still in the
            // client display (Subject page)
            cy.wait(1000);
            cy.go('back')  // browser back button
            cy.wait(1000);
            cy.clientDisplay().find(selectors.titleSection).contains('Subject 0');

            // then back one more time and we should be back on the client display home page
            cy.wait(1000);
            cy.go('back')  // browser back button
            cy.wait(1000);
            cy.clientDisplay().find(selectors.titleSection).contains('User Skills');
        });

        it('browser back and forward operations', () => {
            cy.createDefaultTinyProject()

            // visit client display
            cy.visit("/native/clientDisplay.html");

            cy.clientDisplay().find(selectors.myRankButton)

            // to subject page
            cy.cdClickSubj(0, 'Subject 0');

            // to skill
            cy.wrapIframe().find('[data-cy="skillProgressTitle-Thor"] [data-cy="skillProgressTitle"]').click()
            cy.wrapIframe().find(selectors.titleSection).contains('Skill Overview')
            cy.wrapIframe().find('[data-cy="skillProgressTitle-Thor"]')

            // click next
            cy.wrapIframe().find(selectors.nextSkillButton).click()
            cy.wrapIframe().find('[data-cy="skillProgressTitle-IronMan"]')

            cy.go('back')
            cy.wrapIframe().find('[data-cy="skillProgressTitle-Thor"]')

            cy.go('back')
            cy.wrapIframe().find(selectors.titleSection).contains('Subject 0')
            cy.clientDisplay().find(selectors.myRankButton)

            cy.go('back')
            cy.clientDisplay().find(selectors.titleSection).contains('User Skills');
            cy.clientDisplay().find(selectors.myRankButton)

            cy.go('forward')
            cy.wrapIframe().find(selectors.titleSection).contains('Subject 0')
            cy.clientDisplay().find(selectors.myRankButton)

            cy.go('forward')
            cy.wrapIframe().find(selectors.titleSection).contains('Skill Overview')
            cy.wrapIframe().find('[data-cy="skillProgressTitle-Thor"]')

            cy.go('back')
            cy.wrapIframe().find(selectors.titleSection).contains('Subject 0')
            cy.clientDisplay().find(selectors.myRankButton)

            cy.wrapIframe().find(selectors.myRankButton).click();
            cy.wrapIframe().find(selectors.titleSection).contains(rankDetailsTitle);

            cy.go('back')
            cy.wrapIframe().find(selectors.titleSection).contains('Subject 0')
            cy.clientDisplay().find(selectors.myRankButton)

            cy.go('back')
            cy.clientDisplay().find(selectors.titleSection).contains('User Skills');
            cy.clientDisplay().find(selectors.myRankButton)
        });

        it('breadcrumb-based navigation', () => {
            cy.createDefaultTinyProject()

            // visit client display
            cy.visit("/native/clientDisplay.html?skillsClientDisplayPath=%2Fsubjects%2Fsubj0%2Frank");
            cy.wrapIframe().find(selectors.titleSection).contains(rankDetailsTitle);

            cy.wrapIframe().find('[data-cy="breadcrumbLink-subj0"]').click()
            cy.wrapIframe().find(selectors.titleSection).contains('Subject 0')
            cy.clientDisplay().find(selectors.myRankButton)

            cy.wrapIframe().find('[data-cy="breadcrumbLink-Overview"]').click()
            cy.clientDisplay().find(selectors.titleSection).contains('User Skills');
            cy.clientDisplay().find(selectors.myRankButton)
        });

        it('deep link and reload', () => {
            cy.createDefaultTinyProject()
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

            // navigate to Rank Overview via direct link
            cy.visit('/native/clientDisplay.html?skillsClientDisplayPath=%2Frank#/showSkills');
            cy.clientDisplay().find(selectors.titleSection).contains(rankDetailsTitle);

            // reload and confirm we are still on Rank Overview page
            cy.reload();
            cy.clientDisplay().find(selectors.titleSection).contains(rankDetailsTitle);
        });

        it('back button after reload', () => {
            cy.createDefaultTinyProject()
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

            // visit client display
            cy.visit("/native/clientDisplay.html?internalBackButton=false");

            cy.clientDisplay().find(selectors.myRankButton)
            cy.clientDisplay().find(selectors.titleSection).contains('User Skills');
            cy.clientDisplay().find(selectors.titleSection).find(selectors.backButton).should('not.exist')

            // to subject page
            cy.cdClickSubj(0, 'Subject 0');

            // navigate to Rank Overview and that it does NOT contain the internal back button
            cy.clientDisplay().find(selectors.myRankButton).click();
            cy.clientDisplay().find(selectors.titleSection).contains(rankDetailsTitle);
            cy.clientDisplay().find(selectors.titleSection).find(selectors.backButton).should('not.exist')

            cy.reload();
            cy.clientDisplay().find(selectors.titleSection).contains(rankDetailsTitle);
            cy.clientDisplay().contains(rankDetailsTitle);

            // click the browser back button and verify that we are still in the
            // client display (Subject page)
            cy.wait(1000);
            cy.go('back')  // browser back button
            cy.wait(1000);
            cy.clientDisplay().find(selectors.titleSection).contains('Subject 0');

            // then back one more time and we should be back on the client display home page
            cy.wait(1000);
            cy.go('back')  // browser back button
            cy.wait(1000);
            cy.clientDisplay().find(selectors.titleSection).contains('User Skills');
        });

        it('route change is passed to the client app', () => {
            cy.createDefaultTinyProject()
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

            // visit client display
            cy.visit('/native/clientDisplay.html?internalBackButton=true');

            // to subject page
            cy.cdClickSubj(0, 'Subject 0');
            cy.get('[data-cy=skillsDisplayPath]').contains('Skills Display Path: [/subjects/subj0]');

            // navigate to Rank Overview and that it does NOT contains the internal back button
            cy.clientDisplay().find(selectors.myRankButton).click();
            cy.clientDisplay().find(selectors.titleSection).contains(rankDetailsTitle);

            cy.get('[data-cy=skillsDisplayPath]').contains('Skills Display Path: [/subjects/subj0/rank]');
        });

    }

    if (Utils.skillsServiceVersionLaterThan('1.6.0')) {
        it('navigate skills-display programmatically', () => {
            cy.createDefaultTinyProject()
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

            // visit client display
            cy.visit('/native/clientDisplay.html?internalBackButton=true');
            cy.clientDisplay().find(selectors.myRankButton)

            // to subject page
            cy.get('[data-cy=navigateButton]').click();
            cy.get('[data-cy=skillsDisplayPath]').contains('Skills Display Path: [/subjects/subj0]');
        });
    }


    if (Utils.skillsServiceVersionLaterThan('3.1.0')) {
        it('export user transcript', () => {
            cy.createDefaultTinyProject()

            // visit client display
            cy.visit("/native/clientDisplay.html");
            cy.clientDisplay().find(selectors.titleSection).contains('User Skills');
            cy.clientDisplay().find(selectors.myRankButton)

            cy.wrapIframe().find('[data-cy="downloadTranscriptBtn"]').click()

            Cypress.Commands.add("readTranscript", () => {
                const pathToPdf = 'cypress/downloads/Very Cool Project with id proj1 - user1 - Transcript.pdf'
                cy.readFile(pathToPdf, { timeout: 10000 }).then(() => {
                    // file exists and was successfully read
                    cy.log(`Transcript [${pathToPdf}] Found!`)
                })
                return cy.task('readPdf', pathToPdf)
            });
            const clean = (text) => {
                return text.replace(/\n/g, '')
            }
            cy.readTranscript().then((doc) => {
                expect(doc.numpages).to.equal(2)
                expect(clean(doc.text)).to.include('SkillTree Transcript')
                expect(clean(doc.text)).to.include('Very Cool Project with id proj1')
                expect(clean(doc.text)).to.include('Level: 0 / 5 ')
                expect(clean(doc.text)).to.include('Points: 0 / 100 ')
                expect(clean(doc.text)).to.include('Skills: 0 / 2 ')
                expect(clean(doc.text)).to.include('user1')
                expect(clean(doc.text)).to.not.include('Badges')

                // should be a title on the 2nd page
                expect(clean(doc.text)).to.include('Subject: Subject 0'.toUpperCase())
                //
                // expect(clean(doc.text)).to.not.include(expectedHeaderAndFooter)
                // expect(clean(doc.text)).to.not.include(expectedHeaderAndFooterCommunityProtected)
                // expect(clean(doc.text)).to.not.include('null')
            })
        });
    }
});
