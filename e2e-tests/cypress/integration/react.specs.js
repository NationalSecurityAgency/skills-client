
const wsTimeout = 2000;

context('React Tests', () => {

    it('level component should be reactive', () => {
        cy.createDefaultProject()
        const sendEventViaDropdownId = '#exampleDirectiveClickEvent';
        Cypress.Commands.add("clickSubmit", () => {
            cy.get(`${sendEventViaDropdownId} .btn`).click()
        })
        Cypress.Commands.add("selectSkill", (skill) => {
            cy.get(`${sendEventViaDropdownId} select`).select(`${skill}`)
        })

        cy.visit('/react/index.html#/')

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
        cy.visit('/react/index.html#/')

        cy.contains('Level 0')
        cy.wait(wsTimeout)  // allow for the ui web-socket handshake to complete

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

    it('global event show correct results', () => {
        cy.createDefaultProject()
        Cypress.Commands.add("reportSkill", (skillId) => {
            cy.backendPost(`/api/projects/proj1/skills/${skillId}`)
        })
        cy.visit('/react/index.html#/')

        cy.contains('Level 0')
        cy.wait(wsTimeout)  // allow for the ui web-socket handshake to complete

        cy.reportSkillForUser('IronMan', 'user1')
        cy.contains('Level 1')

        cy.get("#globalEventResult")
        cy.contains('"skillId": "IronMan"')
        cy.contains('"pointsEarned": 50')
        cy.contains('"skillApplied": true')
        cy.contains(/completed": [[][^]*"type": "Overall",[^]\s*"level": 1/)
    })

    it('level component should NOT update when admin reports skill for other user', () => {

        cy.createDefaultProject()
        Cypress.Commands.add("reportSkill", (skillId) => {
            cy.backendPost(`/api/projects/proj1/skills/${skillId}`)
        })
        cy.visit('/react/index.html#/')

        cy.contains('Level 0')
        cy.wait(wsTimeout)  // allow for the ui web-socket handshake to complete

        cy.backendPost('/api/projects/proj1/skills/IronMan', {userId: 'unknown@skills.org', timestamp: Date.now()})
        cy.contains('Level 0')
    })

    it('skill display', () => {
        cy.createDefaultTinyProject()
        cy.server().route('/api/users/user1/token').as('getToken')
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: 'user1', timestamp: Date.now()})
        cy.visit('/react/index.html#/showSkills')
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
        cy.visit('/react/index.html#/showSkills?isSummaryOnly=true')
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
        cy.visit('/react/index.html#/showSkills?themeName=Dark Blue')
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
        cy.visit('/react/index.html#/showSkills?themeName=Dark Blue&isSummaryOnly=true')
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
        cy.visit('/react/index.html#/showSkills')
        cy.wait('@getStatus')

        cy.contains('Could NOT reach Skills Service')
    });

    it('only display skills up-to the provided version', () => {
        cy.createDefaultTinyProject()
        cy.server().route('/api/users/user1/token').as('getToken')
        cy.backendAddSkill('skillv1', 1)
        cy.backendAddSkill('skillv2', 2)
        cy.visit('/react/index.html#/showSkills')
        cy.wait('@getToken')
        cy.iframe((body) => {
            cy.wait('@getToken')
            cy.wrap(body).contains('Earn up to 200 points')
        })

        cy.visit('/react/index.html#/')
        cy.visit('/react/index.html#/showSkills?skillsVersion=1')
        cy.wait('@getToken')
        cy.iframe((body) => {
            cy.wrap(body).contains('Earn up to 150 points')
        })

        cy.visit('/react/index.html#/')
        cy.visit('/react/index.html#/showSkills?skillsVersion=0')
        cy.wait('@getToken')
        cy.iframe((body) => {
            cy.wrap(body).contains('Earn up to 100 points')
        })

    });

})
