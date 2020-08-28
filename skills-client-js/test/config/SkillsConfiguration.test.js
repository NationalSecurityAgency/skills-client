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
import SkillsConfiguration from '../../src/config/SkillsConfiguration.js';
import {SkillsReporter} from "../../src";

describe('SkillsConfiguration', () => {
  describe('initialization', () => {
    it('exists', () => {
      expect(SkillsConfiguration).not.toBeNull();
    });

    it('throws an error SkillsConfiguration.configure() was never called', () => {
      expect(() => {
        SkillsConfiguration.validate();
      }).toThrow();
    });

    it('setAuthToken updates the authToken', () => {
      const mockAuthToken = Math.random() + 1;
      SkillsConfiguration.configure({ authToken: mockAuthToken, projectId: 'projectId', serviceUrl: 'http://somewhere' });

      expect(SkillsConfiguration.getAuthToken()).toBe(mockAuthToken);

      const newAuthToken = Math.random() + 2;
      SkillsConfiguration.setAuthToken(newAuthToken);

      expect(SkillsConfiguration.getAuthToken()).toBe(newAuthToken);
    });

    describe('initializing', () => {
      describe('isPKIMode', () => {
        it('isPKIMode is false if authenticator is NOT \'pki\'', () => {
          const mockAuthenticator = Math.random();

          SkillsConfiguration.configure({
            authenticator: mockAuthenticator, projectId: 'proj', serviceUrl: 'http://somewhere',
          });

          expect(SkillsConfiguration.isPKIMode()).toBeFalsy();
        });

        it('isPKIMode is true if authenticator is \'pki\'', () => {
          const mockAuthenticator = 'pki';

          SkillsConfiguration.configure({
            authenticator: mockAuthenticator, projectId: 'proj', serviceUrl: 'http://somewhere',
          });

          expect(SkillsConfiguration.isPKIMode()).toBeTruthy();
        });
      });

      it('properly initializes variables', () => {
        const mockServiceUrl = Math.random();
        const mockProjectId = Math.random();
        const mockAuthenticator = Math.random();
        const mockAuthToken = Math.random();

        SkillsConfiguration.configure({
          projectId: mockProjectId,
          serviceUrl: mockServiceUrl,
          authenticator: mockAuthenticator,
          authToken: mockAuthToken,
        });

        expect(SkillsConfiguration.getProjectId()).toBe(mockProjectId);
        expect(SkillsConfiguration.getServiceUrl()).toBe(mockServiceUrl);
        expect(SkillsConfiguration.getAuthenticator()).toBe(mockAuthenticator);
        expect(SkillsConfiguration.getAuthToken()).toBe(mockAuthToken);
      });

      it('notifies afterConfigure Promisees' ,(done) => {
        let resolveCount = 0;
        SkillsConfiguration.afterConfigure().then(() => {
          resolveCount++;
        });

        SkillsConfiguration.afterConfigure().then(() => {
          resolveCount++;
          expect(resolveCount).toBe(2);
          done();
        });

        SkillsConfiguration.configure({ authenticator: 'pki', projectId: 'proj', serviceUrl: 'http://somewhere' });
      });
    });

    describe('validation', () => {
      it('throws an error if projectId is not set', () => {
        expect(() => {
          SkillsConfiguration.configure({
            serviceUrl: 'http://somewhere',
            authenticator: 'pki',
          });
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
        const mockProjectId = Math.random();
        const mockServiceUrl = Math.random();
        const mockAuthenticator = Math.random();

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

    describe('logout', () => {
      it('reinitializes the afterConfigure promise' , () => {
        const oldPromise = SkillsConfiguration.afterConfigure();

        SkillsConfiguration.logout();

        const newPromise = SkillsConfiguration.afterConfigure();

        expect(oldPromise).not.toBe(newPromise);
      });

      it('clears the authToken', () => {
        const mockAuthToken = Math.random();
        SkillsConfiguration.configure({
          authToken: mockAuthToken,
          projectId: 'proj',
          serviceUrl: 'http://some',
          authenticator: 'http://auth',
        });

        expect(SkillsConfiguration.getAuthToken()).toBe(mockAuthToken);

        SkillsConfiguration.logout();

        expect(SkillsConfiguration.getAuthToken()).toBe(null);
      });
    });
  });
});
