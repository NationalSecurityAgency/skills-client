// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const backend = 'http://localhost:8080';
Cypress.Commands.add("backendRegister", (user, pass, grantRoot) => {
    return cy.request(`${backend}/app/users/validExistingDashboardUserId/${user}`)
        .then((response) => {
            if (response.body !== true) {
                cy.log(`Creating user [${user}]`)
                cy.request('PUT', `${backend}/createAccount`, {
                    firstName: 'Firstname',
                    lastName: 'LastName',
                    email: user,
                    password: pass,
                });
                if (grantRoot) {
                    cy.request('POST', `${backend}/grantFirstRoot`);
                }
                cy.request('POST', `${backend}/logout`);
            } else {
                cy.log(`User [${user}] already exist`)
            }
        });
});

Cypress.Commands.add("backendLogin", (user, pass) => {
    cy.request( {
        method: 'POST',
        url: `${backend}/performLogin`,
        body: {
            username: user,
            password: pass
        },
        form: true,
    })
});

Cypress.Commands.add("backendLogout", () => {
    cy.request('POST', '/logout');
});


Cypress.Commands.add("backendPost", (url, body) => {
    cy.request('POST', `${backend}${url}`, body)
});

Cypress.Commands.add("backendAddSkill", (skillId, version = 0, projId ='proj1', subjId='subj0', pointIncrement = 50, numPerformToCompletion = 1) => {
    cy.backendPost(`/admin/projects/${projId}/subjects/${subjId}/skills/${skillId}`, {
        projectId: projId,
        subjectId: subjId,
        skillId: skillId,
        name: `This is ${skillId}`,
        type: "Skill",
        pointIncrement: pointIncrement,
        numPerformToCompletion: numPerformToCompletion,
        pointIncrementInterval: 0,
        numMaxOccurrencesIncrementInterval: -1,
        description: "This skill a skill!",
        version: version,
    })
});

Cypress.Commands.add("createDefaultProject", (numSubj = 3, numSkillsPerSubj = 2, pointIncrement = 50, numPerformToCompletion = 1) => {
    const skillIdsToCreate = ['IronMan', 'Thor']
    const projId = 'proj1'
    cy.backendPost(`/app/projects/${projId}`, {
        projectId: projId,
        name: "Very Cool Project"
    })

    for(let i=0; i < numSubj; i++){
        const subjId = `subj${i}`
        cy.backendPost(`/admin/projects/${projId}/subjects/${subjId}`, {
            projectId: 'proj1',
            subjectId: subjId,
            name: `Subject ${i}`
        })

        for(let j=0; j < numSkillsPerSubj; j++) {
            let skillId = `${subjId}_skill${j}`
            if (skillIdsToCreate.length > 0){
                skillId = skillIdsToCreate.pop()
            }
            cy.backendAddSkill(skillId, 0, projId, subjId, pointIncrement, numPerformToCompletion)
        }
    }
});

Cypress.Commands.add("createDefaultTinyProject", () => {
    cy.createDefaultProject(1, 2, 50)
});

Cypress.Commands.add("iframe", (handleIframeBody) => {
    // iframe is not support natively (as of now)
    cy.get('iframe').then((iframe) => {
        const body = iframe.contents().find('body');
        handleIframeBody(body);
    })
});


