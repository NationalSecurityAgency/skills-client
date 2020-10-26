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
import log from 'js-logger';
import skillsService from '../SkillsService';

if (!window.process) {
  // workaround for sockjs-client relying on 'process' variable being defined.
  // similar issue with 'global' variable discussed here:
  // https://github.com/sockjs/sockjs-client/issues/401
  window.process = {
    env: { DEBUG: undefined },
  };
}

const jsSkillsClientVersion = '__skillsClientVersion__';

let waitForInitializePromise = null;
let initializedResolvers = null;
let initialized = false;
// used purely to validate that configure is called before any other components are utilized
let configureCalled = false;

const initializeAfterConfigurePromise = () => {
  if (!waitForInitializePromise) {
    waitForInitializePromise = new Promise((resolve, reject) => {
      initializedResolvers = {
        resolve,
        reject,
      };
    });
  }
};

const setInitialized = (conf) => {
  log.debug('SkillsClient::SkillsConfiguration::calling initializedResolvers');
  initializedResolvers.resolve();
  skillsService.reportSkillsClientVersion(conf);
  initialized = true;
  log.debug('SkillsClient::SkillsConfiguration::initialized');
};

const setConfigureWasCalled = () => {
  log.info('SkillsClient::SkillConfiguration::configured');
  configureCalled = true;
};

initializeAfterConfigurePromise();

const exportObject = {
  configure({
    serviceUrl,
    projectId,
    authenticator,
    authToken,
  }) {
    if (!this.skillsClientVersion) {
      // this will be replaced at build time with the current skills-client-js
      // version. extensions of the plain JS client (vue, react, etc), should
      // override with their version before configure() is called
      this.skillsClientVersion = jsSkillsClientVersion;
    }
    if (!projectId || projectId === 'null') {
      throw new Error(`SkillTree: SkillsConfiguration.configure received invalid parameter for projectId=[${projectId}]`);
    }
    if (!serviceUrl || serviceUrl === 'null') {
      throw new Error(`SkillTree: SkillsConfiguration.configure received invalid parameter for serviceUrl=[${serviceUrl}]`);
    }
    if (!authToken && (!authenticator || authenticator === 'null')) {
      throw new Error(`SkillTree: SkillsConfiguration.configure received invalid parameter for authenticator=[${authenticator}]`);
    }
    this.projectId = projectId;
    this.serviceUrl = serviceUrl;
    this.authenticator = authenticator;
    this.authToken = authToken;

    skillsService.getServiceStatus(`${this.getServiceUrl()}/public/status`).then((response) => {
      this.status = response.status;
      skillsService.configureLogging(this, response);
      log.info(`Returned status [${JSON.stringify(response)}]`);
      if (response.oAuthProviders && response.oAuthProviders.includes(authenticator)) {
        this.authenticator = `${this.getServiceUrl()}/oauth2/authorization/${authenticator}`;
        log.info(`Auto configured authenticator [${this.authenticator}] for provider [${authenticator}]`);
      }

      if (!this.isPKIMode() && !this.getAuthToken()) {
        skillsService.getAuthenticationToken(this.getAuthenticator(), this.getServiceUrl(), this.getProjectId())
          .then((token) => {
            this.setAuthToken(token);
            setInitialized(this);
            setConfigureWasCalled();
          });
      } else {
        setInitialized(this);
        setConfigureWasCalled();
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error getting service status', error);
      setInitialized(this);
      setConfigureWasCalled();
    });
  },

  afterConfigure() {
    return waitForInitializePromise;
  },

  validate() {
    if (!this.serviceUrl || !this.projectId || !this.authenticator) {
      const errorMessage = `SkillTree: SkillsConfiguration was not configured and serviceUrl, projectId and authenticationUrl are missing. Please call: 
      SkillsConfiguration.configure(serviceUrl, myProjectId, authenticator);
SkillsConfiguration is a singleton and you only have to do this once. Please see the docs for more info.`;
      throw new Error(errorMessage);
    }
  },

  isPKIMode() {
    return this.getAuthenticator() === 'pki' || this.getAuthToken() === 'pki';
  },

  isOAuthMode() {
    return skillsService.isOAuthMode(this.authenticator, this.serviceUrl);
  },

  isInitialized() {
    return initialized;
  },

  wasConfigureCalled() {
    return configureCalled;
  },

  getProjectId() {
    return this.projectId;
  },

  getServiceUrl() {
    return this.serviceUrl;
  },

  getAuthenticator() {
    return this.authenticator;
  },

  getAuthToken() {
    return this.authToken;
  },

  getServiceStatus() {
    return this.status;
  },

  setAuthToken(authToken) {
    this.authToken = authToken;
  },

  logout() {
    initializedResolvers = null;
    waitForInitializePromise = null;
    initializeAfterConfigurePromise();
    this.setAuthToken(null);
  },
};

export default exportObject;
