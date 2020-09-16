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
    cy.request('POST', `${backend}/logout`);
});


Cypress.Commands.add("backendPost", (url, body) => {
    cy.request('POST', `${backend}${url}`, body)
});

Cypress.Commands.add("reportSkill", (skillId, projId = 'proj1') => {
    cy.backendPost(`/api/projects/${projId}/skills/${skillId}`)
})

Cypress.Commands.add("reportSkillForUser", (skillId, userId, projId = 'proj1', timestamp = Date.now()) => {
    cy.backendPost(`/api/projects/${projId}/skills/${skillId}`, {userId: userId, timestamp: timestamp})
})

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

Cypress.Commands.add("createDefaultProject", (numSubj = 3, numSkillsPerSubj = 2, pointIncrement = 50, numPerformToCompletion = 1, projId ='proj1') => {
    const skillIdsToCreate = ['IronMan', 'Thor']
    cy.backendPost(`/app/projects/${projId}`, {
        projectId: projId,
        name: `Very Cool Project with id ${projId}`
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

Cypress.Commands.add("createDefaultTinyProject", (projId ='proj1') => {
    cy.createDefaultProject(1, 2, 50, 1, projId)
});

Cypress.Commands.add("iframe", (handleIframeBody) => {
    // iframe is not support natively (as of now)
    cy.get('iframe').then((iframe) => {
        const body = iframe.contents().find('body');
        handleIframeBody(body);
    })
});

Cypress.Commands.add('visitHomePage', (homepage) => {
    let skillsWebsocketConnected = null;
    cy.visit(homepage, {
        onBeforeLoad(win) {
            skillsWebsocketConnected = cy.spy().as('skillsWebsocketConnected')
            const postMessage = win.postMessage.bind(win)
            win.postMessage = (what, target) => {
                if (Cypress._.isPlainObject(what) && what.skillsWebsocketConnected) {
                    skillsWebsocketConnected(what)
                }
                return postMessage(what, target)
            }
            cy.spy(win, 'postMessage').as('postMessage')
        }
    });
    // wait for web socket to connect
    cy.get('@skillsWebsocketConnected').its('lastCall.args.0').its('skillsWebsocketConnected').should('eq', true);
    cy.window().should('have.property', 'skillsLogger')
    cy.skillsLog(`Visit Home page for test [${Cypress.mocha.getRunner().test.title}]`)
});

Cypress.Commands.add("cdClickSubj", (subjIndex, expectedTitle) => {
    cy.wrapIframe().find(`.user-skill-subject-tile:nth-child(${subjIndex+1})`).first().click();
    if (expectedTitle){
        cy.wrapIframe().contains(expectedTitle);
    }
});

Cypress.Commands.add("cdBack", (expectedTitle = 'User Skills') => {
    cy.wrapIframe().find('[data-cy=back]').click()
    cy.wrapIframe().find('h2').contains(expectedTitle);

    // back button should not exist on the home page, whose title is the default value
    if (expectedTitle === 'User Skills'){
        cy.wrapIframe().find('[data-cy=back]').should('not.exist');
    }
});

Cypress.Commands.add('wrapIframe', () => {
  return cy.get('iframe')
      .its('0.contentDocument.body').should('not.be.empty')
      .then(cy.wrap)
});

Cypress.Commands.add('skillsLog', (message) => {
  cy.window().then(win => {
    if (win.skillsLogger) {
      win.skillsLogger.info(message) 
    } else {
      console.error('no skillsLogger found in window');
      console.log(message);
    }
  });
});