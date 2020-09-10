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

if (!window.process) {
  // workaround for sockjs-client relying on 'process' variable being defined.
  // similar issue with 'global' variable discussed here:
  // https://github.com/sockjs/sockjs-client/issues/401
  window.process = {
    env: { DEBUG: undefined },
  };
}

const jsSkillsClientVersion = '__skillsClientVersion__';
const reportSkillsClientVersion = (conf) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', `${conf.getServiceUrl()}/api/projects/${conf.getProjectId()}/skillsClientVersion`);
  xhr.withCredentials = true;
  if (!conf.isPKIMode()) {
    xhr.setRequestHeader('Authorization', `Bearer ${conf.getAuthToken()}`);
  }
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status !== 200) {
        reject(new Error(`Unable to report skillsClientVersion.  Received status [${xhr.status}]`));
      } else {
        resolve(JSON.parse(xhr.response));
      }
    }
  };

  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify({ skillsClientVersion: conf.skillsClientVersion }));
});

const sendLogMessage = (conf, messages, context) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', `${conf.getServiceUrl()}/public/log`);
  // xhr.withCredentials = true;
  // if (!conf.isPKIMode()) {
  //   xhr.setRequestHeader('Authorization', `Bearer ${conf.getAuthToken()}`);
  // }
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status !== 200) {
        reject(new Error(`Unable to send client log message.  Received status [${xhr.status}]`));
      } else {
        resolve(JSON.parse(xhr.response));
      }
    }
  };

  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify({ message: messages[0], level: context.level }));
});

const configureLogging = (conf) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `${conf.getServiceUrl()}/public/status`);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status !== 200) {
        reject(new Error(`Unable to retrieve client configuration.  Received status [${xhr.status}]`));
      } else {
        const response = JSON.parse(xhr.response);
        if (response.loggingEnabled) {
          const consoleHandler = log.createDefaultHandler();
          log.setHandler((messages, context) => {
            consoleHandler(messages, context);
            sendLogMessage(conf, messages, context);
          });
          log.setLevel(log[response.loggingLevel]);
          log.info(`SkillConfiguration::Logger enabled, log level set to [${response.loggingLevel}]`);
        }
        resolve();
      }
    }
  };
  xhr.send();
});

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
  log.debug('SkillsConfiguration::calling initializedResolvers');
  initializedResolvers.resolve();
  reportSkillsClientVersion(conf);
  initialized = true;
  log.debug('SkillsConfiguration::initialized');
};

const setConfigureWasCalled = () => {
  configureCalled = true;
};

initializeAfterConfigurePromise();

const getAuthenticationToken = function getAuthenticationToken(authenticator) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', authenticator);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status !== 200) {
          reject(new Error(`SkillTree: Unable to authenticate using [${authenticator}] endpoint. Response Code=[${xhr.status}].\n
  Ideas to diagnose:\n
      (1) verify that the authenticator property is correct.\n
      (2) verify that the server providing the authenticator endpoint is responding (ex. daemon is running, network path is clear).\n
      (3) check logs on the server providing authenticator endpoint.\n
Full Response=[${xhr.response}]`));
        } else {
          const response = JSON.parse(xhr.response);
          if (!response.access_token) {
            reject(new Error(`SkillTree: Response from [${authenticator}] endpoint did have NOT have 'access_token' attribute. \n
  Ideas to diagnose:\n
      (1) verify that the authenticator property is correct.\n
      (2) check implementation of the authenticator endpoint; it must return payload that has 'access_token' attribute.\n
Full Response=[${xhr.response}]`));
          } else {
            resolve(response.access_token);
          }
        }
      }
    };

    xhr.send();
  });
};

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
    configureLogging(this).then(() => {
      if (!this.isPKIMode() && !this.getAuthToken()) {
        getAuthenticationToken(this.getAuthenticator())
          .then((token) => {
            this.setAuthToken(token);
            setInitialized(this);
          });
      } else {
        setInitialized(this);
      }
      setConfigureWasCalled();
      log.info('SkillConfiguration::configured');
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
