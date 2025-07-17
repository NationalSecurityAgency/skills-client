/*
 * Copyright 2025 SkillTree
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

import mock from 'xhr-mock';
import SkillsConfiguration from '../../src/config/SkillsConfiguration';

/**
 * @jest-environment jsdom
 */
describe('SkillsConfigurationValidation', () => {
    const mockStatusResponse = '{"status":"OK","clientLib":{"loggingEnabled":"false","loggingLevel":"DEBUG"}}';
    const mockVersionResponse = '{"success":true,"explanation":null}';
    let statusReqCount = 0;

    // replace the real XHR object with the mock XHR object before each test
    beforeEach(() => {
        mock.setup();
        SkillsConfiguration.logout();
        const url = /.*\/api\/projects\/.*\/skillsClientVersion/;
        mock.post(url, (req, res) => res.status(200).body(mockVersionResponse));
        mock.get(/.*\/public\/status/, (req, res) => {
            statusReqCount++;
            return res.status(200).body(mockStatusResponse);
        });
    });

    // put the real XHR object back and clear the mocks after each test
    afterEach(() => {
        SkillsConfiguration.logout();
        mock.teardown();
        statusReqCount = 0;
    });

    it('throws an error if projectId is not set', () => {
        expect(() => {
            SkillsConfiguration.configure({
                serviceUrl: 'http://somewhere',
                authenticator: 'pki',
            });

            // when an error occurs during initialization isInitialized should be false, but wasConfigureCalled should be true
            expect(SkillsConfiguration.isInitialized()).toBe(false);
            expect(SkillsConfiguration.wasConfigureCalled()).toBe(true);
        }).toThrow('SkillTree: SkillsConfiguration.configure received invalid parameter for projectId=[undefined]');
    });

    it('throws an error if projectId is set to null', () => {
        expect(() => {
            SkillsConfiguration.configure({
                projectId: null,
                serviceUrl: 'http://somewhere',
                authenticator: 'pki',
            });
        }).toThrow('SkillTree: SkillsConfiguration.configure received invalid parameter for projectId=[null]');
    });

    it('throws an error if serviceUrl is set to null', () => {
        expect(() => {
            SkillsConfiguration.configure({
                projectId: 'proj',
                serviceUrl: null,
                authenticator: 'pki',
            });
        }).toThrow('SkillTree: SkillsConfiguration.configure received invalid parameter for serviceUrl=[null]');
    });

    it('throws an error if serviceUrl is not set', () => {
        expect(() => {
            SkillsConfiguration.configure({
                projectId: 'proj',
                authenticator: 'pki',
            });
        }).toThrow('SkillTree: SkillsConfiguration.configure received invalid parameter for serviceUrl=[undefined]');
    });

    it('throws an error if authenticator is set to null', () => {
        expect(() => {
            SkillsConfiguration.configure({
                projectId: 'proj',
                serviceUrl: 'http://some',
                authenticator: 'null',
            });
        }).toThrow('SkillTree: SkillsConfiguration.configure received invalid parameter for authenticator=[null]');
    });

    it('throws an error if authenticator is not set', () => {
        expect(() => {
            SkillsConfiguration.configure({
                projectId: 'proj',
                serviceUrl: 'http://some',
            });
        }).toThrow('SkillTree: SkillsConfiguration.configure received invalid parameter for authenticator=[undefined]');
    });

    it('does not throw an error if everything is set', () => {
        const mockProjectId = Math.random().toString();
        const mockServiceUrl = Math.random().toString();
        const mockAuthenticator = 'pki';

        const configObject = {
            projectId: mockProjectId,
            serviceUrl: mockServiceUrl,
            authenticator: mockAuthenticator,
        };

        SkillsConfiguration.configure(configObject);

        expect(() => {
            SkillsConfiguration.validate();
        }).not.toThrow();
    });

});
