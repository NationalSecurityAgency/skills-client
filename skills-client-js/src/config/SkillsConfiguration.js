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
        reject(new Error('Unable to report skillsClientVersion'));
      } else {
        resolve(JSON.parse(xhr.response));
      }
    }
  };

  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify({ skillsClientVersion: conf.skillsClientVersion }));
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
  initializedResolvers.resolve();
  reportSkillsClientVersion(conf);
  initialized = true;
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
          reject(new Error('Unable to authenticate'));
        } else {
          const response = JSON.parse(xhr.response);
          if (!response.access_token) {
            reject(new Error('Unable to authenticate'));
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
    this.projectId = projectId;
    this.serviceUrl = serviceUrl;
    this.authenticator = authenticator;
    this.authToken = authToken;
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
  },

  afterConfigure() {
    return waitForInitializePromise;
  },

  validate() {
    let errorMessage = null;
    if (!this.serviceUrl || !this.projectId || !this.authenticator) {
      errorMessage = 'You must configure a serviceUrl, projectId and authenticationUrl for SkillsReportService to use for the service';
      errorMessage += '';
      errorMessage += 'import SkillsConfiguration from \'@skilltree/skills-client-configuration\';';
      errorMessage += 'SkillsConfiguration.configure(serviceUrl, myProjectId, authenticationUrl);';
      errorMessage += '';
      errorMessage += 'SkillsConfiguration is a singleton and you only have to do this once.';
    }
    if (errorMessage) {
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
