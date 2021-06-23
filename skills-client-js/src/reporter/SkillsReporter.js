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
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';
import log from 'js-logger';
import SkillsConfiguration from '../config/SkillsConfiguration';
import skillsService from '../SkillsService';

const SUCCESS_EVENT = 'skills-report-success';
const FAILURE_EVENT = 'skills-report-error';

const successHandlerCache = new Set();
const errorHandlerCache = new Set();

let retryIntervalId = null;

const callSuccessHandlers = (event) => {
  successHandlerCache.forEach((it) => it(event));
};

const callErrorHandlers = (event) => {
  // eslint-disable-next-line no-console
  console.error('Error reporting skill:', event);
  errorHandlerCache.forEach((it) => it(event));
};

const connectWebsocket = (serviceUrl) => {
  const wsUrl = `${serviceUrl}/skills-websocket`;
  log.info(`SkillsClient::SkillsReporter::connecting websocket using SockJS to [${wsUrl}]`);
  const socket = new SockJS(wsUrl);
  const stompClient = Stomp.over(socket);
  stompClient.debug = () => {};
  let headers = {};
  if (!SkillsConfiguration.isPKIMode()) {
    log.debug('SkillsClient::SkillsReporter::adding Authorization header to web socket connection');
    headers = { Authorization: `Bearer ${SkillsConfiguration.getAuthToken()}` };
  }
  if (!stompClient.connected) {
    log.info('SkillsClient::SkillsReporter::connecting stompClient over ws');
    stompClient.connect(headers, () => {
      log.info('SkillsClient::SkillsReporter::stompClient connected');
      const topic = `/user/queue/${SkillsConfiguration.getProjectId()}-skill-updates`;
      log.info(`SkillsClient::SkillsReporter::stompClient subscribing to topic [${topic}]`);
      stompClient.subscribe(topic, (update) => {
        log.info(`SkillsClient::SkillsReporter::ws message [${update.body}] received over topic [${topic}]. calling success handlers...`);
        callSuccessHandlers(JSON.parse(update.body));
        log.info('SkillsClient::SkillsReporter::Done calling success handlers...');
      });
      window.postMessage({ skillsWebsocketConnected: true }, window.location.origin);
      log.info('SkillsClient::SkillsReporter::window.postMessage skillsWebsocketConnected');
    });
  }
};

const retryQueueKey = 'skillTreeRetryQueue';
const defaultMaxRetryQueueSize = 1000;
const defaultRetryInterval = 60000;
const defaultMaxRetryAttempts = 1440;
const retryErrors = function retryErrors() {
  const retryQueue = JSON.parse(localStorage.getItem(retryQueueKey));
  localStorage.removeItem(retryQueueKey);
  if (retryQueue !== null) {
    retryQueue.forEach((item) => {
      log.info(`SkillsClient::SkillsReporter::retryErrors retrying skillId [${item.skillId}], timestamp [${item.timestamp}], retryAttempt [${item.retryAttempt}]`);
      this.reportSkill(item.skillId, 0, item.timestamp, true, item.retryAttempt);
    });
  }
};

const addToRetryQueue = (skillId, timeReported, retryAttempt, xhr, maxQueueSize) => {
  log.info(`SkillsClient::SkillsReporter::addToRetryQueue [${skillId}], timeReported [${timeReported}], retryAttempt[${retryAttempt}], status [${xhr.status}]`);
  if (xhr.response) {
    const xhrResponse = JSON.parse(xhr.response);
    if (xhrResponse && xhrResponse.errorCode === 'SkillNotFound') {
      log.info('not adding to retry queue because the skillId does not exist.');
      return;
    }
  }
  let retryQueue = JSON.parse(localStorage.getItem(retryQueueKey));
  if (retryQueue == null) {
    retryQueue = [];
  }
  if (retryQueue.length < maxQueueSize) {
    const timestamp = (timeReported == null) ? Date.now() : timeReported;
    retryQueue.push({ skillId, timestamp, retryAttempt });
    localStorage.setItem(retryQueueKey, JSON.stringify(retryQueue));
  } else {
    log.warn(`Max retry queue size has been reached (${maxQueueSize}), Unable to retry skillId [${skillId}]`);
  }
};

const authenticateAndRetry = function authenticateAndRetry(userSkillId, attemptCount, resolve, reject) {
  log.info(`SkillsClient::SkillsReporter::authenticateAndRetry [${userSkillId}] attemptCount [${attemptCount}]`);
  skillsService.getAuthenticationToken(SkillsConfiguration.getAuthenticator(), SkillsConfiguration.getServiceUrl(), SkillsConfiguration.getProjectId())
    .then((token) => {
      SkillsConfiguration.setAuthToken(token);
      this.reportSkill(userSkillId, attemptCount + 1)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    })
    .catch((error) => {
      reject(error);
    });
};

const SkillsReporter = {
  configure({
    notifyIfSkillNotApplied, retryInterval = defaultRetryInterval, maxRetryQueueSize = defaultMaxRetryQueueSize, maxRetryAttempts = defaultMaxRetryAttempts,
  }) {
    this.notifyIfSkillNotApplied = notifyIfSkillNotApplied;
    this.retryInterval = retryInterval;
    this.maxRetryQueueSize = maxRetryQueueSize;
    this.maxRetryAttempts = maxRetryAttempts;
  },

  addSuccessHandler(handler) {
    if (!this.websocketConnected) {
      SkillsConfiguration.afterConfigure()
        .then(() => {
          connectWebsocket(SkillsConfiguration.getServiceUrl());
        });
      this.websocketConnected = true;
    }
    successHandlerCache.add(handler);
    log.info(`SkillsClient::SkillsReporter::added success handler [${handler ? handler.toString() : handler}]`);
  },
  addErrorHandler(handler) {
    errorHandlerCache.add(handler);
    log.info(`SkillsClient::SkillsReporter::added error handler [${handler ? handler.toString() : handler}]`);
  },
  reportSkill(userSkillId, count = undefined, timestamp = null, isRetry = false, retryAttempt = undefined) {
    log.info(`SkillsClient::SkillsReporter::reporting skill [${userSkillId}] count [${count}]`);
    SkillsConfiguration.validate();
    if (!this.retryEnabled) {
      log.info('SkillsClient::SkillsReporter::Enabling retries...');
      retryIntervalId = setInterval(() => { retryErrors.call(this); }, this.retryInterval || defaultRetryInterval);
      this.retryEnabled = true;
    }
    if (count >= 25) {
      const errorMessage = 'Unable to authenticate after 25 attempts';
      log.error(`SkillsReporter::${errorMessage}`);
      throw new Error(errorMessage);
    }

    let countInternal = 0;
    if (count !== undefined) {
      countInternal = count;
    }

    let retryAttemptInternal = 1;
    if (retryAttempt !== undefined) {
      retryAttemptInternal = retryAttempt + 1;
    }

    const promise = new Promise((resolve, reject) => {
      if (!SkillsConfiguration.getAuthToken() && !SkillsConfiguration.isPKIMode()) {
        authenticateAndRetry.call(this, userSkillId, countInternal, resolve, reject);
      } else {
        const xhr = new XMLHttpRequest();

        xhr.open('POST', `${SkillsConfiguration.getServiceUrl()}/api/projects/${SkillsConfiguration.getProjectId()}/skills/${userSkillId}`);
        xhr.withCredentials = true;
        if (!SkillsConfiguration.isPKIMode()) {
          xhr.setRequestHeader('Authorization', `Bearer ${SkillsConfiguration.getAuthToken()}`);
        }

        xhr.onreadystatechange = () => {
          // some browsers don't understand XMLHttpRequest.Done, which should be 4
          if (xhr.readyState === 4) {
            if (xhr.status !== 200 && xhr.status !== 401) {
              if (retryAttemptInternal <= this.maxRetryAttempts) {
                addToRetryQueue(userSkillId, timestamp, retryAttemptInternal, xhr, this.maxRetryQueueSize || defaultMaxRetryQueueSize);
              } else {
                log.warn(`Max retry attempts has been reached (${this.maxRetryAttempts}), Unable to retry skillId [${userSkillId}]`);
              }
              if (xhr.response) {
                reject(JSON.parse(xhr.response));
              } else {
                reject(new Error(`Error occurred reporting skill [${userSkillId}], status returned [${xhr.status}]`));
              }
            } else if ((xhr.status === 401) && !SkillsConfiguration.isPKIMode()) {
              authenticateAndRetry.call(this, userSkillId, countInternal, resolve, reject);
            } else {
              resolve(JSON.parse(xhr.response));
            }
          }
        };

        const body = JSON.stringify({ timestamp, notifyIfSkillNotApplied: this.notifyIfSkillNotApplied, isRetry });
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(body);
        log.info(`SkillsClient::SkillsReporter::reporting skill request sent: ${body}`);
      }
    });

    promise.catch((error) => {
      callErrorHandlers(error);
    });

    return promise;
  },

  getConf() {
    return SkillsConfiguration;
  },

  cancelRetryChecker() {
    clearInterval(retryIntervalId);
    this.retryEnabled = false;
  },

};

export {
  SkillsReporter,
  SUCCESS_EVENT,
  FAILURE_EVENT,
};
