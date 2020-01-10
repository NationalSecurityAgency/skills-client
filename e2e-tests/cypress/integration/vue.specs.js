context('Vue Tests', () => {
    beforeEach(() => {
        cy.createDefaultProject()
    })

    it('level component should be reactive', () => {
        const sendEventViaDropdownId = '#exampleDirectiveClickEvent';
        Cypress.Commands.add("clickSubmit", () => {
            cy.get(`${sendEventViaDropdownId} .btn`).click()
        })
        Cypress.Commands.add("selectSkill", (skill) => {
            cy.get(`${sendEventViaDropdownId} .multiselect`).type(`${skill}{enter}`)
        })

        cy.visit('/vuejs#/')

        cy.contains('Level 0')

        cy.selectSkill('skill0')
        cy.clickSubmit()
        cy.contains('Level 0')
        cy.clickSubmit()
        cy.contains('Level 1')
        cy.clickSubmit()
        cy.contains('Level 2')

        cy.selectSkill('skill1')
        cy.clickSubmit()
        cy.contains('Level 2')
        cy.clickSubmit()
        cy.contains('Level 2')
        cy.clickSubmit()
        cy.contains('Level 3')

        cy.selectSkill('skill2')
        cy.clickSubmit()
        cy.contains('Level 3')
        cy.clickSubmit()
        cy.contains('Level 4')
        cy.clickSubmit()
        cy.contains('Level 4')

        cy.selectSkill('skill3')
        cy.clickSubmit()
        cy.contains('Level 4')
        cy.clickSubmit()
        cy.contains('Level 5')
        cy.clickSubmit()
        cy.contains('Level 5')
    })
})
