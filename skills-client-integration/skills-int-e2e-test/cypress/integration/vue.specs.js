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

const homePage = '/vuejs#/'

context('Vue Tests', () => {

    it('level component should be reactive', () => {
        // cy.window().then(win => {
        //     const skillsLogger = win.skillsLogger;
        //     skillsLogger.info('enter: level component should be reactive');
        // })
        cy.createDefaultProject()
        const sendEventViaDropdownId = '#PureJSReportAnySkill';
        Cypress.Commands.add("clickSubmit", () => {
            cy.get(`${sendEventViaDropdownId} .btn`).click()
        })
        Cypress.Commands.add("selectSkill", (skill) => {
            cy.get(`${sendEventViaDropdownId} .multiselect`).type(`${skill}{enter}`)
        })

        cy.visitHomePage(homePage);

        cy.contains('Level 0')

        cy.selectSkill('IronMan')
        cy.clickSubmit()
        cy.contains('Level 1')

        cy.selectSkill('Thor')
        cy.clickSubmit()
        cy.contains('Level 2')

        cy.selectSkill('subj1_skill0')
        cy.clickSubmit()
        cy.contains('Level 3')

        cy.selectSkill('subj1_skill1')
        cy.clickSubmit()
        cy.contains('Level 3')

        cy.selectSkill('subj2_skill0')
        cy.clickSubmit()
        cy.contains('Level 4')

        cy.selectSkill('subj2_skill1')
        cy.clickSubmit()
        cy.contains('Level 5')
    })

    it('level component should load initial level', () => {
        cy.createDefaultProject()
        // cy.reportSkill('subj1_skill0')

        // this will increment levels for skills@skills.org but Level and display components display data for the proxyUser
        // validate that level is still 0
        cy.reportSkillForUser('IronMan', 'skills@skill.org')
        cy.visitHomePage(homePage);
        cy.contains('Level 0')


        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'))
        cy.visitHomePage(homePage);
        cy.contains('Level 1')
    })

    it('level component should be reactive (skills reported directly to backend endpoint)', () => {
        cy.createDefaultProject()
        cy.visitHomePage(homePage);

        cy.contains('Level 0')

        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'))
        cy.contains('Level 1')

        cy.reportSkillForUser('Thor', Cypress.env('proxyUser'))
        cy.contains('Level 2')

        cy.reportSkillForUser('subj1_skill0', Cypress.env('proxyUser'))
        cy.contains('Level 3')

        cy.reportSkillForUser('subj1_skill1', Cypress.env('proxyUser'))
        cy.contains('Level 3')

        cy.reportSkillForUser('subj2_skill0', Cypress.env('proxyUser'))
        cy.contains('Level 4')

        cy.reportSkillForUser('subj2_skill1', Cypress.env('proxyUser'))
        cy.contains('Level 5')
    })

    it('global event show correct results', () => {
        cy.createDefaultProject()
        cy.visitHomePage(homePage);

        cy.contains('Level 0')

        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'))

        cy.contains('Level 1')
        cy.get('[data-cy=globalEventResult]').contains('"skillId": "IronMan"')
        cy.get('[data-cy=globalEventResult]').contains('"pointsEarned": 50')
        cy.get('[data-cy=globalEventResult]').contains('"skillApplied": true')
        cy.get('[data-cy=globalEventResult]').contains(/completed": [[][^]*"type": "Overall",[^]\s*"level": 1/)
    })

    it('global event does not update when skill reported for a different project', () => {
        cy.createDefaultProject()
        cy.createDefaultTinyProject('proj2')
        cy.visitHomePage(homePage);

        cy.contains('Level 0')

        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'), 'proj2')

        cy.contains('Level 0')
        cy.get('[data-cy=globalEventResult]').should('be.empty');
    })

    it('global event is not reported when skill is not applied', () => {
        cy.createDefaultProject()
        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'))

        cy.visitHomePage(homePage);

        cy.contains('Level 1')

        cy.reportSkillForUser('IronMan', Cypress.env('proxyUser'))
        cy.contains('Level 1')

        cy.get('[data-cy=globalEventResult]').should('be.empty');
    })

    it('level component should not update when admin reports skill for other user', () => {

        cy.createDefaultProject()
        Cypress.Commands.add("reportSkill", (skillId) => {
            cy.backendPost(`/api/projects/proj1/skills/${skillId}`)
        })
        cy.visitHomePage(homePage);

        cy.contains('Level 0')

        cy.reportSkillForUser('IronMan', 'unknown@skills.org')
        cy.contains('Level 0')
    })

    it('v-skill directive on click', () => {
        cy.createDefaultProject(1, 2, 50, 2)

        cy.intercept('POST', '/api/projects/proj1/skills/IronMan').as('postSkill')

        cy.visit('/vuejs#/')

        Cypress.Commands.add("clickOnDirectiveBtn", (skillApplied = true) => {
            cy.get('#SkillsDirectiveClickEvent button').click()
            cy.wait('@postSkill').then((intercept) => {
                expect(intercept.response.statusCode).to.eq(200)
                expect(intercept.response.body).to.have.property('skillApplied').to.eq(skillApplied)
            });
        })

        cy.clickOnDirectiveBtn()
        cy.clickOnDirectiveBtn()
        cy.clickOnDirectiveBtn(false)
    })

    it('v-skill directive on input', () => {
        cy.createDefaultProject(1, 2, 50, 2)
        cy.intercept('POST', '/api/projects/proj1/skills/Thor').as('postSkill')

        cy.visitHomePage(homePage);

        Cypress.Commands.add("typeToInput", (skillApplied = true) => {
            cy.get('#SkillsDirectiveInputEvent input').type('h')
            cy.wait('@postSkill').then((intercept) => {
                expect(intercept.response.statusCode).to.eq(200)
                expect(intercept.response.body).to.have.property('skillApplied').to.eq(skillApplied)
            });
        })

        cy.typeToInput()
        cy.typeToInput()
        cy.typeToInput(false)
    })

    it('v-skill directive on click with error', () => {
        cy.createDefaultTinyProject()
        cy.intercept('POST', '/api/projects/proj1/skills/DoesNotExist').as('postSkill')

        cy.visitHomePage(homePage);

        cy.get('#SkillsDirectiveErrorwithButton button').click()
        cy.wait('@postSkill').then((intercept) => {
            expect(intercept.response.statusCode).to.eq(404)
            expect(intercept.response.body).to.have.property('explanation').to.eq('Failed to report skill event because skill definition does not exist.')
        });
    })

    it('v-skill directive on input with error', () => {
        cy.createDefaultTinyProject()
        cy.intercept('POST', '/api/projects/proj1/skills/DoesNotExist').as('postSkill')

        cy.visitHomePage(homePage);

        cy.get('#SkillsDirectiveErrorwithInput input').type('h')
        cy.wait('@postSkill').then((intercept) => {
            expect(intercept.response.statusCode).to.eq(404)
            expect(intercept.response.body).to.have.property('explanation').to.eq('Failed to report skill event because skill definition does not exist.')
        });
    })

    it('skill display', () => {
        cy.createDefaultTinyProject()
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})
        cy.visit('/vuejs#/showSkills')
        cy.clientDisplay(true).contains('My Level')
        cy.clientDisplay().contains('50 Points earned Today')
        cy.clientDisplay().contains('Subject 0')

        // verify that there is no background set
        // cypress always validates against rgb
        cy.clientDisplay().find('.skills-page-title-text-color')
            .should('have.css', 'background-color').and('equal', 'rgb(255, 255, 255)');
    })

    it('Proxy Skills Display', () => {
        if (!Cypress.env('oauthMode')) {
            cy.createDefaultTinyProject()
            cy.createDefaultTinyProject('proj2')

            cy.intercept(Cypress.env('tokenUrl')).as('getToken')
            cy.intercept('/api/users/proj2/user2/token').as('getToken2')
            cy.intercept('api/projects/proj1/rank').as('getRankUser2')
            cy.intercept('api/projects/proj1/pointHistory').as('getPointsHistoryUser2')
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})
            cy.visit('/vuejs#/showSkills')
            cy.wait('@getToken')
            // cy.wait('@getToken')
            cy.clientDisplay(true).contains('My Level')
            cy.clientDisplay().contains('50 Points earned Today')
            cy.clientDisplay().contains('Subject 0')

            // verify that there is no background set
            // cypress always validates against rgb
            cy.clientDisplay().find('.skills-page-title-text-color')
                .should('have.css', 'background-color').and('equal', 'rgb(255, 255, 255)');

            cy.visit('/vuejs#/proxyShowSkills')
            cy.wait('@getToken2')
            cy.wait('@getRankUser2')
            cy.wait('@getPointsHistoryUser2')
            cy.clientDisplay().contains('My Level')
            cy.clientDisplay().contains('0 Points earned Today')
        }
    })

    it('skill display - summary only', () => {
        cy.createDefaultTinyProject()
        cy.intercept(Cypress.env('tokenUrl')).as('getToken')
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})
        cy.visit('/vuejs#/showSkills?isSummaryOnly=true')
        cy.clientDisplay(true).contains('My Level')
        cy.clientDisplay().contains('50 Points earned Today')
        cy.clientDisplay().contains('Subject 0').should('not.exist')

        // verify that there is no background set
        // cypress always validates against rgb
        cy.clientDisplay().find('.skills-page-title-text-color')
            .should('have.css', 'background-color').and('equal', 'rgb(255, 255, 255)');
    })

    it('skill display - theme', () => {
        cy.createDefaultTinyProject()
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})
        cy.visit('/vuejs#/showSkills?themeName=Dark Blue')
        cy.clientDisplay(true).contains('My Level')
        cy.clientDisplay().contains('50 Points earned Today')
        cy.clientDisplay().contains('Subject 0')

        // verify dark blue background of hex #152E4d
        // cypress always validates against rgb
        cy.clientDisplay().find('.skills-page-title-text-color')
            .should('have.css', 'background-color').and('equal', 'rgb(21, 46, 77)');
    })

    it('skill display - summary only - theme', () => {
        cy.createDefaultTinyProject()
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})
        cy.visit('/vuejs#/showSkills?themeName=Dark Blue&isSummaryOnly=true')
        cy.clientDisplay(true).contains('My Level')
        cy.clientDisplay().contains('50 Points earned Today')
        cy.clientDisplay().contains('Subject 0').should('not.exist')

        // verify dark blue background of hex #152E4d
        // cypress always validates against rgb
        cy.clientDisplay().find('.skills-page-title-text-color')
            .should('have.css', 'background-color').and('equal', 'rgb(21, 46, 77)');
    })

    it('client display should display an error if skills service is down', () => {
        cy.createDefaultTinyProject()
        cy.intercept('/public/status',
        {
            statusCode: 503, // server is down
            body: {}
        }).as('getStatus')
        cy.visit('/vuejs#/showSkills')
        cy.wait('@getStatus')

        cy.contains('Could NOT reach Skilltree Service')
    });

    it('only display skills up-to the provided version', () => {
        cy.createDefaultTinyProject()
        cy.backendAddSkill('skillv1', 1)
        cy.backendAddSkill('skillv2', 2)

        cy.visit('/vuejs#/showSkills')
        cy.clientDisplay(true).contains('Earn up to 200 points')

        cy.visit('/vuejs#/')
        cy.get('[data-cy=reportSkillsLink]').should('be.visible');

        cy.visit('/vuejs#/showSkills?skillsVersion=1')
        cy.clientDisplay().contains('Earn up to 150 points')

        cy.visit('/vuejs#/')
        cy.get('[data-cy=reportSkillsLink]').should('be.visible');

        cy.visit('/vuejs#/showSkills?skillsVersion=0')
        cy.clientDisplay().contains('Earn up to 100 points')
    });

    it('skillsClientVersion is reported correctly', () => {
        cy.createDefaultProject()
        cy.intercept('POST', '/api/projects/proj1/skillsClientVersion', (req) => {
            expect(req.body).to.have.property('skillsClientVersion').and.to.contain('@skilltree/skills-client-vue-')
            req.reply((res) => {
                expect(res.statusCode).to.eq(200)
                expect(res.body).to.have.property('success').to.eq(true)
            })
        }).as('reportClientVersion')

        cy.visit('/vuejs#/')
        cy.wait('@reportClientVersion')
    })

    /*it('Proxy User Display', () => {
        cy.createDefaultProject()
        cy.createDefaultTinyProject('proj2')
        //need a view that is the default user and a view to show another user
        const sendEventViaDropdownId = '#PureJSReportAnySkill';
        Cypress.Commands.add("clickSubmit", () => {
            cy.get(`${sendEventViaDropdownId} .btn`).click()
        })
        Cypress.Commands.add("selectSkill", (skill) => {
            cy.get(`${sendEventViaDropdownId} .multiselect`).type(`${skill}{enter}`)
        })

        cy.visitHomePage(homePage);

        cy.contains('Level 0')

        cy.selectSkill('IronMan')
        cy.clickSubmit()
        cy.contains('Level 1')

        cy.intercept(Cypress.env('tokenUrl')).as('getToken')
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})
        cy.get('[data-cy=userDisplayLink]').click();
        //cy.contains('User Display').click();
        /!*cy.wait('@getToken')
        console.log('got token')
        cy.iframe((body) => {
            cy.wait('@getToken')
            console.log('got token again')

            cy.wrap(body).contains('My Level')

            // verify that there is no background set
            // cypress always validates against rgb
            cy.wrap(body).find('.skills-page-title-text-color')
              .should('have.css', 'background-color').and('equal', 'rgb(255, 255, 255)');
        });*!/
    })*/

    if (Utils.skillsServiceVersionLaterThan('1.2.0')) {
        it('back button when when returning from an external page', () => {
            cy.createDefaultTinyProject()
            cy.intercept(Cypress.env('tokenUrl')).as('getToken')
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

            // visit client display
            cy.visit('/vuejs#/showSkills?refreshPage=false')
            // cy.wait('@getToken')

            cy.clientDisplay(true).find('[data-cy=back]').should('not.exist');
            cy.clientDisplay().contains('User Skills');

            // navigate to Rank Overview that contains the back button
            cy.clientDisplay().find('[data-cy=myRank]').click();
            cy.clientDisplay().contains('Rank Overview');
            cy.clientDisplay().find('[data-cy=back]').should('exist');

            // now visit the "Report Skills" (external) page
            cy.get('[data-cy=reportSkillsLink]').click()
            cy.contains('Report Skills Examples');

            // switch back to the the client display
            cy.get('[data-cy=userDisplayLink]').click()
        });
    }

    if (Utils.skillsServiceVersionLaterThan('1.2.0')) {
        it('back button when when returning from an external page - multiple layers deep', () => {
            cy.createDefaultTinyProject()
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

            // visit client display
            cy.visit('/vuejs#/showSkills?refreshPage=false')

            cy.clientDisplay().find('[data-cy=back]').should('not.exist');
            cy.clientDisplay().contains('User Skills');

            // to subject page
            cy.cdClickSubj(0, 'Subject 0');

            // navigate to Rank Overview that contains the back button
            cy.clientDisplay().find('[data-cy=myRank]').click();
            cy.clientDisplay().contains('Rank Overview');
            cy.clientDisplay().find('[data-cy=back]').should('exist');

            // now visit the "Report Skills" (external) page
            cy.get('[data-cy=reportSkillsLink]').click()
            cy.contains('Report Skills Examples');

            // switch back to the the client display
            cy.get('[data-cy=userDisplayLink]').click()
            // verify we are still on the Rank Overview page
            cy.clientDisplay(true).contains('Rank Overview');

            // click the back button and verify that we are still in the
            // client display (Subject page)
            cy.cdBack('Subject 0');

            // then back one more time and we should be back on the client display home page
            cy.cdBack('User Skills');
        });
    }


})
