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

let waitForInitializePromise = null;
let initializedResolvers = null;

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

const setInitialized = () => {
  initializedResolvers.resolve();
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
    this.projectId = projectId;
    this.serviceUrl = serviceUrl;
    this.authenticator = authenticator;
    this.authToken = authToken;
    if (!this.isPKIMode() && !this.getAuthToken()) {
      getAuthenticationToken(this.getAuthenticator())
        .then((token) => {
          this.setAuthToken(token);
          setInitialized();
        });
    } else {
      setInitialized();
    }
  },

  afterConfigure() {
    return waitForInitializePromise;
  },

  validate() {
    let errorMessage = null;
    if (!this.serviceUrl || !this.projectId || !this.authenticator) {
      errorMessage = 'You must configure a serviceUrl, projectId and authenticationUrl for SkillsReportService to use for the service';
      errorMessage += '';
      errorMessage += 'import SkillsConfiguration from \'@skills/skills-client-configuration\';';
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
