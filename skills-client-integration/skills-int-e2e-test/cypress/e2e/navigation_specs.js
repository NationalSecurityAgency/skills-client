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

context("Navigation Tests", () => {

    it('internal back button when when returning from an external page', () => {
        cy.onlyOn(Utils.skillsClientJSVersionLaterThan('3.3.0'))
        cy.createDefaultTinyProject()
        cy.intercept(Cypress.env('tokenUrl')).as('getToken')
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

        // visit client display
        const url = Utils.skillsClientJSVersionLaterThan('3.3.0')  ? '?internalBackButton=true' : ''
        cy.visitSkillsDisplay(url);

        // cy.clientDisplay(true)
        cy.wrapIframe().find(selectors.myRankButton)
        cy.wrapIframe().find(selectors.titleSection).find(selectors.backButton).should('not.exist')

        // navigate to Rank Overview that contains the back button
        cy.wrapIframe().find(selectors.myRankButton).click();
        cy.wrapIframe().find(selectors.titleSection).contains(Utils.rankDetailsTitle());
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
        const url = Utils.skillsClientJSVersionLaterThan('3.3.0')  ? '?internalBackButton=true' : ''
        cy.visitSkillsDisplay(url);

        cy.clientDisplay().find(selectors.myRankButton)
        cy.clientDisplay().find(selectors.titleSection).find(selectors.backButton).should('not.exist')

        // to subject page
        cy.cdClickSubj();

        // navigate to Rank Overview that contains the back button
        cy.clientDisplay().find(selectors.myRankButton).click();
        cy.clientDisplay().find(selectors.titleSection).contains(Utils.rankDetailsTitle());
        cy.clientDisplay().find(selectors.backButton).should('exist');

        // click the back button and verify that we are still in the
        // client display (Subject page)
        cy.cdBack('Subject 0');

        // then back one more time and we should be back on the client display home page
        cy.cdBack('User Skills');
    });

    it('browser back button works correctly when internal back button is not present', () => {
        cy.onlyOn(Utils.skillsClientJSVersionLaterThan('3.3.0'))
        cy.createDefaultTinyProject()
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

        // visit client display
        cy.visit("/native/clientDisplay.html?internalBackButton=false");

        cy.clientDisplay().find(selectors.myRankButton)
        cy.clientDisplay().find(selectors.titleSection).find(selectors.backButton).should('not.exist')

        // to subject page
        cy.cdClickSubj();
        cy.clientDisplay().find(selectors.titleSection).find(selectors.backButton).should('not.exist')

        // navigate to Rank Overview and that it does NOT contains the internal back button
        cy.clientDisplay().find(selectors.myRankButton).click()
        cy.clientDisplay().find(selectors.titleSection).contains(Utils.rankDetailsTitle());
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

    if (Utils.skillsServiceVersionLaterThan('3.1.1')) {
        it('browser back and forward operations', () => {
            cy.onlyOn(Utils.skillsClientJSVersionLaterThan('3.3.0'))
            cy.createDefaultTinyProject()

            // visit client display
            cy.visit("/native/clientDisplay.html");

            cy.clientDisplay().find(selectors.myRankButton)

            // to subject page
            cy.cdClickSubj();

            // to skill
            cy.wrapIframe().find(selectors.buildSkillLinkSelector('Thor')).click()
            cy.wrapIframe().find(selectors.titleSection).contains('Skill Overview')
            cy.wrapIframe().find(selectors.buildSkillTitleSelector('Thor'))

            // // click next
            cy.wrapIframe().find(selectors.nextSkillButton).click()
            cy.wrapIframe().find(selectors.buildSkillTitleSelector('IronMan'))

            cy.go('back')
            cy.wrapIframe().find(selectors.buildSkillTitleSelector('Thor'))

            cy.go('back')
            cy.wrapIframe().find(selectors.titleSection).contains('Subject 0')
            cy.clientDisplay().find(selectors.myRankButton)

            cy.go('back')
            cy.clientDisplay().find(selectors.titleSection).contains('User Skills');
            cy.clientDisplay().find(selectors.myRankButton)

            cy.go('forward')
            cy.wrapIframe().find(selectors.titleSection).contains('Subject 0')
            cy.clientDisplay().find(selectors.myRankButton)

            // cy.go('forward')
            // cy.wrapIframe().find(selectors.titleSection).contains('Skill Overview')
            // cy.wrapIframe().find(selectors.buildSkillTitleSelector('Thor'))
            //
            // cy.go('back')
            // cy.wrapIframe().find(selectors.titleSection).contains('Subject 0')
            // cy.clientDisplay().find(selectors.myRankButton)
            //
            // cy.wrapIframe().find(selectors.myRankButton).click();
            // cy.wrapIframe().find(selectors.titleSection).contains(Utils.rankDetailsTitle());
            //
            // cy.go('back')
            // cy.wrapIframe().find(selectors.titleSection).contains('Subject 0')
            // cy.clientDisplay().find(selectors.myRankButton)
            //
            // cy.go('back')
            // cy.clientDisplay().find(selectors.titleSection).contains('User Skills');
            // cy.clientDisplay().find(selectors.myRankButton)
        });
    }
    it('breadcrumb-based navigation', () => {
        cy.onlyOn(Utils.skillsClientJSVersionLaterThan('3.3.0'))
        cy.createDefaultTinyProject()

        // visit client display
        cy.visit("/native/clientDisplay.html?skillsClientDisplayPath=%2Fsubjects%2Fsubj0%2Frank");
        cy.wrapIframe().find(selectors.titleSection).contains(Utils.rankDetailsTitle());

        cy.wrapIframe().find(selectors.buildBreadcrumbLinkSelector('subj0')).click()
        cy.wrapIframe().find(selectors.titleSection).contains('Subject 0')
        cy.clientDisplay().find(selectors.myRankButton)

        cy.wrapIframe().find(selectors.buildBreadcrumbLinkSelector('Overview')).click()
        cy.clientDisplay().find(selectors.titleSection).contains('User Skills');
        cy.clientDisplay().find(selectors.myRankButton)
    });

    it('deep link and reload', () => {
        cy.onlyOn(Utils.skillsClientJSVersionLaterThan('3.3.0'))
        cy.createDefaultTinyProject()
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

        // navigate to Rank Overview via direct link
        cy.visitSkillsDisplay('?skillsClientDisplayPath=%2Frank#/showSkills');
        cy.clientDisplay().find(selectors.titleSection).contains(Utils.rankDetailsTitle());

        // reload and confirm we are still on Rank Overview page
        cy.reload();
        cy.clientDisplay().find(selectors.titleSection).contains(Utils.rankDetailsTitle());
    });

    it('back button after reload', () => {
        cy.onlyOn(Utils.skillsClientJSVersionLaterThan('3.3.0'))
        cy.createDefaultTinyProject()
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

        // visit client display
        cy.visit("/native/clientDisplay.html?internalBackButton=false");

        cy.clientDisplay().find(selectors.myRankButton)
        cy.clientDisplay().find(selectors.titleSection).contains('User Skills');
        cy.clientDisplay().find(selectors.titleSection).find(selectors.backButton).should('not.exist')

        // to subject page
        cy.cdClickSubj();

        // navigate to Rank Overview and that it does NOT contain the internal back button
        cy.clientDisplay().find(selectors.myRankButton).click();
        cy.clientDisplay().find(selectors.titleSection).contains(Utils.rankDetailsTitle());
        cy.clientDisplay().find(selectors.titleSection).find(selectors.backButton).should('not.exist')

        cy.reload();
        cy.clientDisplay().find(selectors.titleSection).contains(Utils.rankDetailsTitle());
        cy.clientDisplay().contains(Utils.rankDetailsTitle());

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
        cy.onlyOn(Utils.skillsClientJSVersionLaterThan('3.3.0'))
        cy.createDefaultTinyProject()
        cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

        // visit client display
        cy.visitSkillsDisplay('?internalBackButton=true');

        // to subject page
        cy.cdClickSubj();
        cy.get('[data-cy=skillsDisplayPath]').contains('Skills Display Path: [/subjects/subj0]');

        // navigate to Rank Overview and that it does NOT contains the internal back button
        cy.clientDisplay().find(selectors.myRankButton).click();
        cy.clientDisplay().find(selectors.titleSection).contains(Utils.rankDetailsTitle());

        cy.get('[data-cy=skillsDisplayPath]').contains('Skills Display Path: [/subjects/subj0/rank]');
    });

    if (Utils.skillsServiceVersionLaterThan('3.1.1')) {
        it('navigate skills-display programmatically', () => {
            cy.onlyOn(Utils.skillsClientJSVersionLaterThan('3.3.1'))
            cy.createDefaultTinyProject()
            cy.backendPost('/api/projects/proj1/skills/Thor', {userId: Cypress.env('proxyUser'), timestamp: Date.now()})

            // visit client display
            cy.visitSkillsDisplay('?internalBackButton=true');
            cy.clientDisplay().find(selectors.myRankButton)

            // to subject page
            cy.get('[data-cy=navigateButton]').click();
            cy.get('[data-cy=skillsDisplayPath]').contains('Skills Display Path: [/subjects/subj0]');
        });
    }


});
