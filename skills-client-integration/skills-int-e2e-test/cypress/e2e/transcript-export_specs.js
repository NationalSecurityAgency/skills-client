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


context("Transcript Export Tests", () => {

    beforeEach(() => {
        Cypress.Commands.add("getFileName", (projName) => {
            const userName =  Cypress.env('oauthMode') ? 'foo bar (foo)' : 'user1'
            return `./cypress/downloads/${projName} - ${userName} - Transcript.pdf`
        })
    })
    if (Utils.skillsServiceVersionLaterThan('3.1.0')) {
        const expectedHeaderAndFooter = 'For All Dragons enjoyment'
        const expectedHeaderAndFooterCommunityProtected = 'For Divine Dragon enjoyment'

        it('export user transcript', () => {
            const projName = 'Export1'
            cy.createDefaultTinyProject('proj1', projName)

            // visit client display
            cy.visitSkillsDisplay();
            cy.clientDisplay().find(selectors.titleSection).contains('User Skills');
            cy.clientDisplay().find(selectors.myRankButton)

            cy.wrapIframe().find('[data-cy="downloadTranscriptBtn"]').click()

            Cypress.Commands.add("readTranscript", () => {
                const pathToPdf = cy.getFileName(projName)
                cy.readFile(pathToPdf, { timeout: 10000 }).then(() => {
                    // file exists and was successfully read
                    cy.log(`Transcript [${pathToPdf}] Found!`)
                })
                return cy.task('readPdf', pathToPdf)
            });
            const clean = (text) => {
                return text.replace(/\n/g, '')
            }
            cy.readTranscript().then((doc) => {
                expect(doc.numpages).to.equal(2)
                expect(clean(doc.text)).to.include('SkillTree Transcript')
                expect(clean(doc.text)).to.include(projName)
                expect(clean(doc.text)).to.include('Level: 0 / 5 ')
                expect(clean(doc.text)).to.include('Points: 0 / 100 ')
                expect(clean(doc.text)).to.include('Skills: 0 / 2 ')
                expect(clean(doc.text)).to.include('user1')
                expect(clean(doc.text)).to.not.include('Badges')

                // should be a title on the 2nd page
                expect(clean(doc.text)).to.include('Subject: Subject 0'.toUpperCase())

                expect(clean(doc.text)).to.not.include(expectedHeaderAndFooter)
                expect(clean(doc.text)).to.not.include(expectedHeaderAndFooterCommunityProtected)
                expect(clean(doc.text)).to.not.include('null')
            })
        });

        it('export user transcript - community header', () => {
            cy.intercept('GET', '/public/config', (req) => {
                req.reply((res) => {
                    const conf = res.body;
                    conf.exportHeaderAndFooter = 'For {{community.project.descriptor}} enjoyment';
                    res.send(conf);
                });
            }).as('getPublicConfig');
            const projName = 'Export2'
            cy.createDefaultTinyProject('proj1', projName)

            // visit client display
            cy.visitSkillsDisplay();
            cy.wait('@getPublicConfig')
            cy.clientDisplay().find(selectors.titleSection).contains('User Skills');
            cy.clientDisplay().find(selectors.myRankButton)

            cy.wrapIframe().find('[data-cy="downloadTranscriptBtn"]').click()
            Cypress.Commands.add("readTranscript", () => {
                const pathToPdf = cy.getFileName(projName)
                cy.readFile(pathToPdf, { timeout: 10000 }).then(() => {
                    // file exists and was successfully read
                    cy.log(`Transcript [${pathToPdf}] Found!`)
                })
                return cy.task('readPdf', pathToPdf)
            });
            const clean = (text) => {
                return text.replace(/\n/g, '')
            }
            cy.readTranscript().then((doc) => {
                expect(doc.numpages).to.equal(2)
                expect(clean(doc.text)).to.include('SkillTree Transcript')
                expect(clean(doc.text)).to.include(projName)
                expect(clean(doc.text)).to.include('Level: 0 / 5 ')
                expect(clean(doc.text)).to.include('Points: 0 / 100 ')
                expect(clean(doc.text)).to.include('Skills: 0 / 2 ')
                expect(clean(doc.text)).to.include('user1')
                expect(clean(doc.text)).to.not.include('Badges')

                // should be a title on the 2nd page
                expect(clean(doc.text)).to.include('Subject: Subject 0'.toUpperCase())

                expect(clean(doc.text)).to.include(expectedHeaderAndFooter)
                expect(clean(doc.text)).to.not.include(expectedHeaderAndFooterCommunityProtected)
                expect(clean(doc.text)).to.not.include('null')
            })
        });

        if (!Cypress.env('oauthMode')) {
            it('export user transcript - community protected header', () => {
                cy.intercept('GET', '/public/config', (req) => {
                    req.reply((res) => {
                        const conf = res.body;
                        conf.exportHeaderAndFooter = 'For {{community.project.descriptor}} enjoyment';
                        res.send(conf);
                    });
                }).as('getPublicConfig');
                const projName = 'Export3'
                cy.createDefaultTinyProject('proj1', projName)

                const allDragonsUser = 'allDragons@email.org'
                cy.fixture('vars.json').then((vars) => {
                    cy.backendLogout();
                    cy.backendRegister('user1', vars.defaultPass);
                    cy.backendLogin(vars.rootUser, vars.defaultPass, true);
                    cy.backendPost(`/root/users/user1/tags/dragons`, {tags: ['DivineDragon']});
                    cy.backendPost(`/root/users/${vars.defaultUser}/tags/dragons`, {tags: ['DivineDragon']});
                    cy.backendLogout();

                    cy.backendRegister(allDragonsUser, vars.defaultPass);
                    cy.backendLogout();

                    cy.backendLogin(vars.defaultUser, vars.defaultPass);
                });
                cy.backendPost(`/admin/projects/proj1`, {
                    projectId: 'proj1',
                    name: projName,
                    enableProtectedUserCommunity: true
                })

                // visit client display
                cy.visitSkillsDisplay();
                cy.wait('@getPublicConfig')
                cy.clientDisplay().find(selectors.titleSection).contains('User Skills');
                cy.clientDisplay().find(selectors.myRankButton)

                cy.wrapIframe().find('[data-cy="downloadTranscriptBtn"]').click()
                Cypress.Commands.add("readTranscript", () => {
                    const pathToPdf = `cypress/downloads/${projName} - Firstname LastName (user1) - Transcript.pdf`
                    cy.readFile(pathToPdf, {timeout: 10000}).then(() => {
                        // file exists and was successfully read
                        cy.log(`Transcript [${pathToPdf}] Found!`)
                    })
                    return cy.task('readPdf', pathToPdf)
                });
                const clean = (text) => {
                    return text.replace(/\n/g, '')
                }
                cy.readTranscript().then((doc) => {
                    expect(doc.numpages).to.equal(2)
                    expect(clean(doc.text)).to.include('SkillTree Transcript')
                    expect(clean(doc.text)).to.include(projName)
                    expect(clean(doc.text)).to.include('Level: 0 / 5 ')
                    expect(clean(doc.text)).to.include('Points: 0 / 100 ')
                    expect(clean(doc.text)).to.include('Skills: 0 / 2 ')
                    expect(clean(doc.text)).to.include('user1')
                    expect(clean(doc.text)).to.not.include('Badges')

                    // should be a title on the 2nd page
                    expect(clean(doc.text)).to.include('Subject: Subject 0'.toUpperCase())

                    expect(clean(doc.text)).to.not.include(expectedHeaderAndFooter)
                    expect(clean(doc.text)).to.include(expectedHeaderAndFooterCommunityProtected)
                    expect(clean(doc.text)).to.not.include('null')
                })
            });
        }
    }
});
