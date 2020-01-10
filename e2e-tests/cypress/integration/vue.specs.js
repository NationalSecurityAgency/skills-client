context('Vue Tests', () => {
    beforeEach(() => {

    })

    it('level component should be reactive', () => {
        cy.createDefaultProject()

        const sendEventViaDropdownId = '#exampleDirectiveClickEvent';
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
})
