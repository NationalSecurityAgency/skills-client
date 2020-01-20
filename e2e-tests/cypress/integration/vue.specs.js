context('Vue Tests', () => {

    it('level component should be reactive', () => {
        cy.createDefaultProject()
        const sendEventViaDropdownId = '#PureJSReportAnySkill';
        Cypress.Commands.add("clickSubmit", () => {
            cy.get(`${sendEventViaDropdownId} .btn`).click()
        })
        Cypress.Commands.add("selectSkill", (skill) => {
            cy.get(`${sendEventViaDropdownId} .multiselect`).type(`${skill}{enter}`)
        })

        cy.visit('/vuejs#/')

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

    it('level component should be reactive (skills reported directly to backend endpoint)', () => {
        cy.createDefaultProject()
        Cypress.Commands.add("reportSkill", (skillId) => {
            cy.backendPost(`/api/projects/proj1/skills/${skillId}`)
        })
        cy.visit('/vuejs#/')

        cy.contains('Level 0')
        cy.wait(1000)  // allow for the ui web-socket handshake to complete

        cy.reportSkillForUser('IronMan', 'user1')
        cy.contains('Level 1')

        cy.reportSkillForUser('Thor', 'user1')
        cy.contains('Level 2')

        cy.reportSkillForUser('subj1_skill0', 'user1')
        cy.contains('Level 3')

        cy.reportSkillForUser('subj1_skill1', 'user1')
        cy.contains('Level 3')

        cy.reportSkillForUser('subj2_skill0', 'user1')
        cy.contains('Level 4')

        cy.reportSkillForUser('subj2_skill1', 'user1')
        cy.contains('Level 5')
    })

    it.only('level component should update when admin reports skill for current user', () => {

        cy.createDefaultProject()
        cy.visit('/vuejs#/')

        cy.contains('Level 0')
        cy.wait(1000)  // allow for the ui web-socket handshake to complete

        cy.reportSkillForUser('IronMan', 'user1')
        cy.contains('Level 1')
    })

    it('level component should NOT update when admin reports skill for other user', () => {

        cy.createDefaultProject()
        Cypress.Commands.add("reportSkill", (skillId) => {
            cy.backendPost(`/api/projects/proj1/skills/${skillId}`)
        })
        cy.visit('/vuejs#/')

        cy.contains('Level 0')

        cy.backendPost('/api/projects/proj1/skills/IronMan', {userId: 'unknown@skills.org', timestamp: Date.now()})
        cy.contains('Level 0')
    })

    it('v-skill directive on click', () => {
        cy.createDefaultProject(1, 2, 50, 2)

        cy.server().route('POST', '/api/projects/proj1/skills/IronMan').as('postSkill')

        cy.visit('/vuejs#/')

        Cypress.Commands.add("clickOnDirectiveBtn", (skillApplied = true) => {
            cy.get('#SkillsDirectiveClickEvent button').click()
            cy.wait('@postSkill')
            cy.get('@postSkill').then((xhr) => {
                expect(xhr.status).to.eq(200)
                expect(xhr.responseBody).to.have.property('skillApplied').to.eq(skillApplied)
            });
        })

        cy.clickOnDirectiveBtn()
        cy.clickOnDirectiveBtn()
        cy.clickOnDirectiveBtn(false)
    })


    it('v-skill directive on input', () => {
        cy.createDefaultProject(1, 2, 50, 2)
        cy.server().route('POST', '/api/projects/proj1/skills/Thor').as('postSkill')

        cy.visit('/vuejs#/')

        Cypress.Commands.add("typeToInput", (skillApplied = true) => {
            cy.get('#SkillsDirectiveInputEvent input').type('h')
            cy.wait('@postSkill')
            cy.get('@postSkill').then((xhr) => {
                expect(xhr.status).to.eq(200)
                expect(xhr.responseBody).to.have.property('skillApplied').to.eq(skillApplied)
            });
        })

        cy.typeToInput()
        cy.typeToInput()
        cy.typeToInput(false)
    })

    it('v-skill directive on click with error', () => {
        cy.createDefaultTinyProject()
        cy.server().route('POST', '/api/projects/proj1/skills/DoesNotExist').as('postSkill')

        cy.visit('/vuejs#/')

        cy.get('#SkillsDirectiveErrorwithButton button').click()
        cy.wait('@postSkill');
        cy.get('@postSkill').then((xhr) => {
            expect(xhr.status).to.eq(400)
            expect(xhr.responseBody).to.have.property('explanation').to.eq('Failed to report skill event because skill definition does not exist.')
        });
    })

    it('v-skill directive on input with error', () => {
        cy.createDefaultTinyProject()
        cy.server().route('POST', '/api/projects/proj1/skills/DoesNotExist').as('postSkill')

        cy.visit('/vuejs#/')

        cy.get('#SkillsDirectiveErrorwithInput input').type('h')
        cy.wait('@postSkill');
        cy.get('@postSkill').then((xhr) => {
            expect(xhr.status).to.eq(400)
            expect(xhr.responseBody).to.have.property('explanation').to.eq('Failed to report skill event because skill definition does not exist.')
        });
    })

    it('skill display', () => {
        cy.createDefaultTinyProject()
        cy.server().route('/api/users/user1/token').as('getToken')
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: 'user1', timestamp: Date.now()})
        cy.visit('/vuejs#/showSkills')
        cy.wait('@getToken')

        cy.iframe((body) => {
            cy.wait('@getToken')

            cy.wrap(body).contains('My Level')
            cy.wrap(body).contains('50 Points earned Today')
            cy.wrap(body).contains('Subject 0')

            // verify that there is no background set
            // cypress always validates against rgb
            cy.wrap(body).find('.skills-page-title-text-color')
                .should('have.css', 'background-color').and('equal', 'rgb(255, 255, 255)');
        });
    })

    it('skill display - summary only', () => {
        cy.createDefaultTinyProject()
        cy.server().route('/api/users/user1/token').as('getToken')
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: 'user1', timestamp: Date.now()})
        cy.visit('/vuejs#/showSkills?isSummaryOnly=true')
        cy.wait('@getToken')
        cy.iframe((body) => {
            cy.wait('@getToken')
            cy.wrap(body).contains('My Level')
            cy.wrap(body).contains('50 Points earned Today')
            cy.wrap(body).contains('Subject 0').should('not.exist')

            // verify that there is no background set
            // cypress always validates against rgb
            cy.wrap(body).find('.skills-page-title-text-color')
                .should('have.css', 'background-color').and('equal', 'rgb(255, 255, 255)');
        })
    })


    it('skill display - theme', () => {
        cy.createDefaultTinyProject()
        cy.server().route('/api/users/user1/token').as('getToken')
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: 'user1', timestamp: Date.now()})
        cy.visit('/vuejs#/showSkills?themeName=Dark Blue')
        cy.wait('@getToken')
        cy.iframe((body) => {
            cy.wait('@getToken')
            cy.wrap(body).contains('My Level')
            cy.wrap(body).contains('50 Points earned Today')
            cy.wrap(body).contains('Subject 0')

            // verify dark blue background of hex #152E4d
            // cypress always validates against rgb
            cy.wrap(body).find('.skills-page-title-text-color')
                .should('have.css', 'background-color').and('equal', 'rgb(21, 46, 77)');
        })
    })


    it('skill display - summary only - theme', () => {
        cy.createDefaultTinyProject()
        cy.server().route('/api/users/user1/token').as('getToken')
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: 'user1', timestamp: Date.now()})
        cy.visit('/vuejs#/showSkills?themeName=Dark Blue&isSummaryOnly=true')
        cy.wait('@getToken')
        cy.iframe((body) => {
            cy.wait('@getToken')
            cy.wrap(body).contains('My Level')
            cy.wrap(body).contains('50 Points earned Today')
            cy.wrap(body).contains('Subject 0').should('not.exist')

            // verify dark blue background of hex #152E4d
            // cypress always validates against rgb
            cy.wrap(body).find('.skills-page-title-text-color')
                .should('have.css', 'background-color').and('equal', 'rgb(21, 46, 77)');
        })
    })

    it('client display should display an error if skills service is down', () => {
        cy.server().route({
            method: 'GET',
            url: '/public/status',
            status: 503, // server is down
            response: {}
        }).as('getStatus')
        cy.visit('/vuejs#/showSkills')
        cy.wait('@getStatus')

        cy.contains('Could NOT reach Skills Service')
    });


    it('only display skills up-to the provided version', () => {
        cy.createDefaultTinyProject()
        cy.server().route('/api/users/user1/token').as('getToken')
        cy.backendAddSkill('skillv1', 1)
        cy.backendAddSkill('skillv2', 2)
        cy.visit('/vuejs#/showSkills')
        cy.wait('@getToken')
        cy.iframe((body) => {
            cy.wait('@getToken')
            cy.wrap(body).contains('Earn up to 200 points')
        })

        cy.visit('/vuejs#/')
        cy.visit('/vuejs#/showSkills?skillsVersion=1')
        cy.wait('@getToken')
        cy.iframe((body) => {
            cy.wrap(body).contains('Earn up to 150 points')
        })

        cy.visit('/vuejs#/')
        cy.visit('/vuejs#/showSkills?skillsVersion=0')
        cy.wait('@getToken')
        cy.iframe((body) => {
            cy.wrap(body).contains('Earn up to 100 points')
        })

    });


})
