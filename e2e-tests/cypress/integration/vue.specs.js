context('Vue Tests', () => {
    beforeEach(() => {
        cy.createDefaultProject()
    })

    it('level component should be reactive', () => {
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
        cy.contains('Level 0')
        cy.clickSubmit()
        cy.contains('Level 0')
        cy.clickSubmit()
        cy.contains('Level 0')
        cy.clickSubmit()
        cy.contains('Level 0')

        cy.selectSkill('Thor')
        cy.clickSubmit()
        cy.contains('Level 1')
        cy.clickSubmit()
        cy.contains('Level 1')
        cy.clickSubmit()
        cy.contains('Level 1')

        cy.selectSkill('subj0_skill2')
        cy.clickSubmit()
        cy.contains('Level 1')
        cy.clickSubmit()
        cy.contains('Level 1')
        cy.clickSubmit()
        cy.contains('Level 2')

        cy.selectSkill('subj0_skill3')
        cy.clickSubmit()
        cy.contains('Level 2')
        cy.clickSubmit()
        cy.contains('Level 2')
        cy.clickSubmit()
        cy.contains('Level 2')

        cy.selectSkill('subj1_skill0')
        cy.clickSubmit()
        cy.contains('Level 2')
        cy.clickSubmit()
        cy.contains('Level 2')
        cy.clickSubmit()
        cy.contains('Level 2')

        cy.selectSkill('subj1_skill1')
        cy.clickSubmit()
        cy.contains('Level 2')
        cy.clickSubmit()
        cy.contains('Level 3')
        cy.clickSubmit()
        cy.contains('Level 3')

        cy.selectSkill('subj1_skill2')
        cy.clickSubmit()
        cy.contains('Level 3')
        cy.clickSubmit()
        cy.contains('Level 3')
        cy.clickSubmit()
        cy.contains('Level 3')

        cy.selectSkill('subj1_skill3')
        cy.clickSubmit()
        cy.contains('Level 3')
        cy.clickSubmit()
        cy.contains('Level 3')
        cy.clickSubmit()
        cy.contains('Level 3')

        cy.selectSkill('subj2_skill0')
        cy.clickSubmit()
        cy.contains('Level 4')
        cy.clickSubmit()
        cy.contains('Level 4')
        cy.clickSubmit()
        cy.contains('Level 4')

        cy.selectSkill('subj2_skill1')
        cy.clickSubmit()
        cy.contains('Level 4')
        cy.clickSubmit()
        cy.contains('Level 4')
        cy.clickSubmit()
        cy.contains('Level 4')

        cy.selectSkill('subj2_skill2')
        cy.clickSubmit()
        cy.contains('Level 4')
        cy.clickSubmit()
        cy.contains('Level 4')
        cy.clickSubmit()
        cy.contains('Level 4')

        cy.selectSkill('subj2_skill3')
        cy.clickSubmit()
        cy.contains('Level 5')
        cy.clickSubmit()
        cy.contains('Level 5')
        cy.clickSubmit()
        cy.contains('Level 5')
    })



    it('v-skill directive on click', () => {
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
        cy.clickOnDirectiveBtn()
        cy.clickOnDirectiveBtn(false)
    })


    it('v-skill directive on input', () => {
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
        cy.typeToInput()
        cy.typeToInput(false)
    })

    it('v-skill directive on click with error', () => {
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
        cy.server().route('/api/users/user1/token').as('getToken')
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: 'user1', timestamp: Date.now()})
        cy.visit('/vuejs#/showSkills')
        cy.wait('@getToken')
        // iframe is not support natively (as of now)
        cy.get('iframe').then((iframe) => {
            cy.wait('@getToken')
            const body = iframe.contents().find('body');
            cy.wrap(body).contains('My Level')
            cy.wrap(body).contains('10 Points earned Today')
            cy.wrap(body).contains('Subject 0')
        })
    })

    it('skill display - summary only', () => {
        cy.server().route('/api/users/user1/token').as('getToken')
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: 'user1', timestamp: Date.now()})
        cy.visit('/vuejs#/showSkills?isSummaryOnly=true')
        cy.wait('@getToken')
        // iframe is not support natively (as of now)
        cy.get('iframe').then((iframe) => {
            cy.wait('@getToken')
            const body = iframe.contents().find('body');
            cy.wrap(body).contains('My Level')
            cy.wrap(body).contains('10 Points earned Today')
            cy.wrap(body).contains('Subject 0').should('not.exist')
        })
    })


})
