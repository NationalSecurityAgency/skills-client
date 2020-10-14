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
const baseUrl = Cypress.config().baseUrl;
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
        cy.log(`User [${user}] already exists`)
      }
    });
});

Cypress.Commands.add("backendLogin", (user, pass) => {
  cy.request({
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
  cy.backendPost(`/api/projects/${projId}/skills/${skillId}`, { userId: userId, timestamp: timestamp })
})

Cypress.Commands.add("backendAddSkill", (skillId, version = 0, projId = 'proj1', subjId = 'subj0', pointIncrement = 50, numPerformToCompletion = 1) => {
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

Cypress.Commands.add("createDefaultProject", (numSubj = 3, numSkillsPerSubj = 2, pointIncrement = 50, numPerformToCompletion = 1, projId = 'proj1') => {
  const skillIdsToCreate = ['IronMan', 'Thor']
  cy.backendPost(`/app/projects/${projId}`, {
    projectId: projId,
    name: `Very Cool Project with id ${projId}`
  }).then((resp => {
    if (Cypress.env('oauthMode')) {
      // if we're in oauthMode, then the foo-hyrda user will own the project. so we need to give the
      // defaultUser admin rights since the user will access the project from the skills-int-service app
      cy.fixture('vars.json').then((vars) => {
        cy.backendPost(`/admin/projects/${projId}/users/${vars.defaultUser}/roles/ROLE_PROJECT_ADMIN`)
      })
    }
  }))

  for (let i = 0; i < numSubj; i++) {
    const subjId = `subj${i}`
    cy.backendPost(`/admin/projects/${projId}/subjects/${subjId}`, {
      projectId: 'proj1',
      subjectId: subjId,
      name: `Subject ${i}`
    })

    for (let j = 0; j < numSkillsPerSubj; j++) {
      let skillId = `${subjId}_skill${j}`
      if (skillIdsToCreate.length > 0) {
        skillId = skillIdsToCreate.pop()
      }
      cy.backendAddSkill(skillId, 0, projId, subjId, pointIncrement, numPerformToCompletion)
    }
  }
});

Cypress.Commands.add("createDefaultTinyProject", (projId = 'proj1') => {
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
  cy.wrapIframe().find(`.user-skill-subject-tile:nth-child(${subjIndex + 1})`).first().click();
  if (expectedTitle) {
    cy.wrapIframe().contains(expectedTitle);
  }
});

Cypress.Commands.add("cdBack", (expectedTitle = 'User Skills') => {
  cy.wrapIframe().find('[data-cy=back]').click()
  cy.wrapIframe().find('h2').contains(expectedTitle);

  // back button should not exist on the home page, whose title is the default value
  if (expectedTitle === 'User Skills') {
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

Cypress.Commands.add('loginBySingleSignOn', (projId = 'proj1') => {
  Cypress.log({
    name: 'loginBySingleSignOn',
  })

  // first try to get a skills token,
  cy.request({
    url: `http://localhost:8080/api/projects/${projId}/token`,
    failOnStatusCode: false,
  }).then((tokenResp) => {
    if (tokenResp.status === 401) {
      cy.skillsLog('Skills token request failed, authenticating with OAuth provider...');
      cy.request({
        url: 'http://localhost:8080/oauth2/authorization/hydra', 
        qs: { skillsRedirectUri: baseUrl, },
        // qs: { skillsRedirectUri: `${baseUrl}${homePage}` },
      }).then((resp) => {
        expect(resp.status).to.eq(200)

        // parse out the authenticity_token
        const $html = Cypress.$(resp.body)
        const authenticityToken = $html.find('input[name=_csrf]').val()
        const challenge = $html.find('input[name=challenge]').val()
        const options = {
          method: 'POST',
          url: 'http://localhost:3000/login',
          form: true, // we are submitting a regular form body
          body: {
            _csrf: authenticityToken,
            challenge,
            email: 'foo@bar.com',
            password: 'foobar',
            submit: 'Log in',
            remember: '1',
          },
        };

        cy.request(options).then((resp2) => {
          expect(resp2.status).to.eq(200)

          cy.skillsLog('Granting consent with OAuth provider...');
          // if (resp2.redirects.filter(r => r.includes('/consent?consent_challenge')).length > 0) {
          if (resp2.redirects[resp2.redirects.length-1].includes('/consent?consent_challenge')) {

            const $html = Cypress.$(resp2.body)
            const authenticityToken = $html.find('input[name=_csrf]').val()
            const challenge = $html.find('input[name=challenge]').val()
            // const consentUrl = resp2.redirects.filter(r => r.includes('/consent?consent_challenge'))[0].split(' ')[1]
            const options = {
              method: 'POST',
              url: 'http://localhost:3000/consent',
              form: true, // we are submitting a regular form body
              qs: { consent_challenge: challenge },
              body: {
                _csrf: authenticityToken,
                challenge,
                grant_scope: 'openid',
                // grant_scope: 'offline',
                submit: 'Allow access',
                remember: '1',
              },
            };

            cy.request(options).then((resp3) => {
              expect(resp3.status).to.eq(200)
            })
          }
        })
      })
    } else {
      cy.skillsLog('Received Skills token, already authenticated with OAuth provider.');
    }
  })
});