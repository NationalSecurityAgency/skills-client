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
import log from 'js-logger';

export default {

  sendLogMessage(serviceUrl, messages, context) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${serviceUrl}/public/log`);
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
  },

  configureLogging(serviceUrl, response) {
    const loggingEnabled = response.clientLib ? response.clientLib.loggingEnabled === 'true' : false;
    if (loggingEnabled) {
      const consoleHandler = log.createDefaultHandler();
      log.setHandler((messages, context) => {
        consoleHandler(messages, context);
        this.sendLogMessage(serviceUrl, messages, context);
      });
      let loggingLevel = log[response.clientLib.loggingLevel];
      log.setLevel(loggingLevel);
      if (!loggingLevel) {
        loggingLevel = log.INFO;
        log.warn(`SkillsClient::SkillService::Unknown log level [${response.clientLib.loggingLevel}], defaulting to INFO`);
      }
      log.info(`SkillsClient::SkillService::Logger enabled, log level set to [${loggingLevel.name}]`);
    }
  },

  reportSkillsClientVersion(conf) {
    return new Promise((resolve, reject) => {
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
  },

  getServiceStatus(statusUrl) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', statusUrl);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status !== 200) {
            reject(new Error(`Unable to retrieve client configuration.  Received status [${xhr.status}]`));
            // throw new Error(`Unable to retrieve client configuration.  Received status [${xhr.status}]`);
          } else {
            resolve(JSON.parse(xhr.response));
          }
        }
      };
      xhr.send();
    });
  },

  isOAuthMode(authenticator, serviceUrl) {
    return typeof authenticator === 'string' && authenticator.startsWith(`${serviceUrl}/oauth2/authorization`);
  },

  getAuthenticationToken(authenticator, serviceUrl, projectId, oauthRedirect = false) {
    return new Promise((resolve, reject) => {
      const isOAuthMode = this.isOAuthMode(authenticator, serviceUrl);
      const xhr = new XMLHttpRequest();
      if (!isOAuthMode) {
        xhr.open('GET', authenticator);
      } else {
        xhr.open('GET', `${serviceUrl}/api/projects/${projectId}/token`);
        xhr.withCredentials = true;
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status !== 200) {
            if (isOAuthMode && oauthRedirect && xhr.status === 401) {
              // if we get 401 and we are using OAuth, then redirect to the OAuth Provider
              const oauthAuthenticator = `${authenticator}?skillsRedirectUri=${window.location}`;
              log.info(`SkillsClient::SkillService::unable to get oAuth token, navigating to [${oauthAuthenticator}]`);
              window.location.assign(oauthAuthenticator);
              resolve();
            } else {
              reject(new Error(`SkillTree: Unable to authenticate using [${authenticator}] endpoint. Response Code=[${xhr.status}].\n
    Ideas to diagnose:\n
        (1) verify that the authenticator property is correct.\n
        (2) verify that the server providing the authenticator endpoint is responding (ex. daemon is running, network path is clear).\n
        (3) check logs on the server providing authenticator endpoint.\n
  Full Response=[${xhr.response}]`));
            }
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
  },
};
