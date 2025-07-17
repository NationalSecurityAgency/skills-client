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
describe('SkillsConfigurationInit', () => {
    const flushPromises = () => new Promise(setImmediate);
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

    it('exists', () => {
        expect(SkillsConfiguration).not.toBeNull();
    });

    it('throws an error SkillsConfiguration.configure() was never called', () => {
        expect(() => {
            SkillsConfiguration.validate();
        }).toThrow();
    });

    it('isInitialized is false when error occurs in configure', () => {
        expect(() => {
            SkillsConfiguration.configure({
                serviceUrl: 'http://somewhere',
                authenticator: 'pki',
            });

            // when an error occurs during initialization isInitialized should be false, but wasConfigureCalled should be true
            expect(SkillsConfiguration.isInitialized()).toBe(false);
            expect(SkillsConfiguration.wasConfigureCalled()).toBe(true);
            expect(statusReqCount).toBe(1);
        }).toThrow('SkillTree: SkillsConfiguration.configure received invalid parameter for projectId=[undefined]');
    });

    it('calling configure more than once after failure will attempt to configure again', async () => {
        expect.assertions(6);

        mock.reset();
        mock.get(/.*\/public\/status/, (req, res) => {
            statusReqCount++;
            return res.status(503);
        });
        const mockAuthenticator = Math.random().toString();
        mock.get(mockAuthenticator, (req, res) => res.status(200).body('{"access_token": "token"}'));

        const config = {
            projectId: Math.random().toString(),
            serviceUrl: Math.random().toString(),
            authenticator: mockAuthenticator,
            authToken: Math.random().toString(),
        };

        SkillsConfiguration.configure(config);
        await new Promise(process.nextTick);
        expect(SkillsConfiguration.isInitialized()).toBe(false);
        expect(SkillsConfiguration.wasConfigureCalled()).toBe(true);
        expect(statusReqCount).toBe(1);


        SkillsConfiguration.configure(config);
        await new Promise(process.nextTick);
        expect(SkillsConfiguration.isInitialized()).toBe(false);
        expect(SkillsConfiguration.wasConfigureCalled()).toBe(true);
        expect(statusReqCount).toBe(2);
    });

    it('calling configure more than once without failure will NOT attempt to configure again', async () => {
        expect.assertions(6);
        const mockAuthenticator = Math.random().toString();
        mock.get(mockAuthenticator, (req, res) => res.status(200).body('{"access_token": "token"}'));
        const config = {
            projectId: Math.random().toString(),
            serviceUrl: Math.random().toString(),
            authenticator: mockAuthenticator,
            authToken: Math.random().toString(),
        };

        SkillsConfiguration.configure(config);
        await new Promise(process.nextTick);
        expect(SkillsConfiguration.isInitialized()).toBe(true);
        expect(SkillsConfiguration.wasConfigureCalled()).toBe(true);
        expect(statusReqCount).toBe(1);

        SkillsConfiguration.configure(config);
        await new Promise(process.nextTick);
        expect(SkillsConfiguration.isInitialized()).toBe(true);
        expect(SkillsConfiguration.wasConfigureCalled()).toBe(true);
        expect(statusReqCount).toBe(1);
    });

    it('setAuthToken updates the authToken', async () => {
        const mockAuthToken = Math.random() + 1;
        SkillsConfiguration.configure({
            authToken: mockAuthToken,
            projectId: 'projectId',
            serviceUrl: 'http://somewhere'
        });
        await new Promise(process.nextTick);

        expect(SkillsConfiguration.getAuthToken()).toBe(mockAuthToken);

        const newAuthToken = Math.random() + 2;
        SkillsConfiguration.setAuthToken(newAuthToken);

        expect(SkillsConfiguration.getAuthToken()).toBe(newAuthToken);
    });

    it('properly initializes variables', async () => {
        expect.assertions(6);

        const mockServiceUrl = Math.random().toString();
        const mockProjectId = Math.random().toString();
        const mockAuthenticator = Math.random().toString();
        const mockAuthToken = Math.random().toString();

        SkillsConfiguration.configure({
            projectId: mockProjectId,
            serviceUrl: mockServiceUrl,
            authenticator: mockAuthenticator,
            authToken: mockAuthToken,
        });
        await new Promise(process.nextTick);

        expect(SkillsConfiguration.getProjectId()).toBe(mockProjectId);
        expect(SkillsConfiguration.getServiceUrl()).toBe(mockServiceUrl);
        expect(SkillsConfiguration.getAuthenticator()).toBe(mockAuthenticator);
        expect(SkillsConfiguration.getAuthToken()).toBe(mockAuthToken);
        expect(SkillsConfiguration.isInitialized()).toBe(true);
        expect(SkillsConfiguration.wasConfigureCalled()).toBe(true);
    });

    it('notifies afterConfigure Promisees', (done) => {
        let resolveCount = 0;
        SkillsConfiguration.afterConfigure().then(() => {
            resolveCount++;
        });

        SkillsConfiguration.afterConfigure().then(() => {
            resolveCount++;
            expect(resolveCount).toBe(2);
            done();
        });

        SkillsConfiguration.configure({authenticator: 'pki', projectId: 'proj', serviceUrl: 'http://somewhere'});
    });

    it('trailing slash and spaces are removed from the serviceUrl', async () => {
            const authEndpoint = 'http://auth/';
            mock.get(authEndpoint, (req, res) => res.status(200).body('{"access_token": "token"}'));
            SkillsConfiguration.configure({
                projectId: 'proj',
                serviceUrl: ' http://some/ ',
                authenticator: authEndpoint,
            });
            await new Promise(process.nextTick);

            expect(SkillsConfiguration.getServiceUrl()).toBe('http://some');
        });
});
