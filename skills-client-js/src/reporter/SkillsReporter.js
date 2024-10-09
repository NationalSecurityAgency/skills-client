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
import { Client } from '@stomp/stompjs';
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

let stompClient;
const connectWebsocket = (serviceUrl) => {
  if (!stompClient || !stompClient.active) {
    const wsUrl = `${serviceUrl}/skills-websocket`;
    log.info(`SkillsClient::SkillsReporter::connecting websocket using SockJS to [${wsUrl}]`);
    if (!stompClient) {
      stompClient = new Client();
    }
    let headers = {};
    if (!SkillsConfiguration.isPKIMode()) {
      log.debug('SkillsClient::SkillsReporter::adding Authorization header to web socket connection');
      headers = { Authorization: `Bearer ${SkillsConfiguration.getAuthToken()}` };
    }

    stompClient.configure({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: headers,
      onConnect: () => {
        log.info('SkillsClient::SkillsReporter::stompClient connected');
        const topic = `/user/queue/${SkillsConfiguration.getProjectId()}-skill-updates`;
        log.info(`SkillsClient::SkillsReporter::stompClient subscribing to topic [${topic}]`);

        stompClient.subscribe(topic, (update) => {
          log.debug(`SkillsClient::SkillsReporter::ws message [${update.body}] received over topic [${topic}]. calling success handlers...`);
          callSuccessHandlers(JSON.parse(update.body));
          log.debug('SkillsClient::SkillsReporter::Done calling success handlers...');
        });
        window.postMessage({ skillsWebsocketConnected: true }, window.location.origin);
        log.debug('SkillsClient::SkillsReporter::window.postMessage skillsWebsocketConnected');
      },
      onStompError: (frame) => {
        log.error(`Received STOMP error event. headers [${JSON.stringify(headers)}] frame [${frame}]`);
        if (!SkillsConfiguration.isPKIMode() && frame && frame.headers && frame.headers.message && frame.headers.message.includes('invalid_token')) {
          skillsService.getAuthenticationToken(SkillsConfiguration.getAuthenticator(), SkillsConfiguration.getServiceUrl(), SkillsConfiguration.getProjectId())
            .then((token) => {
              SkillsConfiguration.setAuthToken(token);
              stompClient.deactivate();
              connectWebsocket(SkillsConfiguration.getServiceUrl());
            })
            .catch((err) => {
              log.error(`SkillsReporter::Unable to retrieve auth token when attempting to reconnect web socket [${err}]`);
            });
        }
      },
      onDisconnect: (frame) => {
        log.info(`Received disconnect event.  frame [${frame}]`);
      },
      // debug: (str) => {
      //   console.log(new Date(), str);
      // },
    });
    log.debug('SkillsClient::SkillsReporter::activating stompClient...');
    stompClient.activate();
    log.debug('SkillsClient::SkillsReporter::stompClient activated');
  } else {
    log.warn('SkillsClient::SkillsReporter::websocket already connecting, preventing duplicate connection.', stompClient.active);
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
      this.reportSkill(item.skillId, item.timestamp, true, item.retryAttempt);
    });
  }
};

const addToRetryQueue = (skillId, timeReported, retryAttempt, xhr, maxQueueSize) => {
  const status = xhr ? xhr.status : null;
  log.info(`SkillsClient::SkillsReporter::addToRetryQueue [${skillId}], timeReported [${timeReported}], retryAttempt[${retryAttempt}], status [${status}]`);
  if (xhr && xhr.response) {
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

const reportInternal = (resolve, reject, userSkillId, timestamp, isRetry, retryAttempt, maxRetryAttempts, maxRetryQueueSize, notifyIfSkillNotApplied) => {
  SkillsConfiguration.validate();
  const xhr = new XMLHttpRequest();

  xhr.open('POST', `${SkillsConfiguration.getServiceUrl()}/api/projects/${SkillsConfiguration.getProjectId()}/skills/${userSkillId}`);
  xhr.withCredentials = true;
  if (!SkillsConfiguration.isPKIMode()) {
    xhr.setRequestHeader('Authorization', `Bearer ${SkillsConfiguration.getAuthToken()}`);
  }

  xhr.onreadystatechange = () => {
    // some browsers don't understand XMLHttpRequest.Done, which should be 4
    if (xhr.readyState === 4) {
      if (xhr.status !== 200) {
        if (retryAttempt <= maxRetryAttempts) {
          if ((xhr.status === 401 || xhr.status === 0) && !SkillsConfiguration.isPKIMode()) {
            SkillsConfiguration.setAuthToken(null);
          }
          addToRetryQueue(userSkillId, timestamp, retryAttempt, xhr, maxRetryQueueSize);
        } else {
          log.warn(`Max retry attempts has been reached (${maxRetryAttempts}), Unable to retry skillId [${userSkillId}]`);
        }
        if (xhr.response) {
          reject(JSON.parse(xhr.response));
        } else {
          reject(new Error(`Error occurred reporting skill [${userSkillId}], status returned [${xhr.status}]`));
        }
      } else {
        resolve(JSON.parse(xhr.response));
      }
    }
  };

  const body = JSON.stringify({ timestamp, notifyIfSkillNotApplied, isRetry });
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(body);
  log.info(`SkillsClient::SkillsReporter::reporting skill request sent: ${body}`);
};

const SkillsReporter = {
  configure({
    notifyIfSkillNotApplied, retryInterval = defaultRetryInterval, maxRetryQueueSize = defaultMaxRetryQueueSize, maxRetryAttempts = defaultMaxRetryAttempts,
  }) {
    this.notifyIfSkillNotApplied = notifyIfSkillNotApplied;
    this.retryInterval = retryInterval;
    this.maxRetryQueueSize = maxRetryQueueSize;
    this.maxRetryAttempts = maxRetryAttempts;

    if (SkillsConfiguration.isDisabled()) {
      log.info('SkillsClient::SkillsReporter::configure: SkillsConfiguration is disabled. No reporting will occur');
      return;
    }

    if (retryInterval != null) {
      // cancel existing RetryChecker, then start w/ passed in retryInterval
      this.cancelRetryChecker();
    }
    log.info(`SkillsClient::SkillsReporter::Enabling retries. retryInterval [${this.retryInterval}]`);
    retryIntervalId = setInterval(() => { retryErrors.call(this); }, this.retryInterval || defaultRetryInterval);
  },

  addSuccessHandler(handler) {
    if (SkillsConfiguration.isDisabled()) {
      log.info('SkillsClient::SkillsReporter::addSuccessHandler: SkillsConfiguration is disabled handler is not added');
      return;
    }
    successHandlerCache.add(handler);
    log.info(`SkillsClient::SkillsReporter::added success handler. successHandlerCache size [${successHandlerCache.size}]`);
  },
  addErrorHandler(handler) {
    if (SkillsConfiguration.isDisabled()) {
      log.info('SkillsClient::SkillsReporter::addErrorHandler: SkillsConfiguration is disabled handler is not added');
      return;
    }
    errorHandlerCache.add(handler);
    log.info(`SkillsClient::SkillsReporter::added error handler. errorHandlerCache size [${errorHandlerCache.size}]`);
  },
  reportSkill(userSkillId, timestamp = null, isRetry = false, retryAttempt = undefined) {
    if (SkillsConfiguration.isDisabled()) {
      log.info(`SkillsClient::SkillsReporter::reportSkill: SkillsConfiguration is disabled. No reporting will occur for skillId=[${userSkillId}]`);
      return Promise.resolve();
    }
    log.info(`SkillsClient::SkillsReporter::reporting skill [${userSkillId}] retryAttempt [${retryAttempt}]`);
    SkillsConfiguration.validate();
    if (retryIntervalId == null) {
      log.info(`SkillsClient::SkillsReporter::Enabling retries. retryInterval [${this.retryInterval}]`);
      retryIntervalId = setInterval(() => { retryErrors.call(this); }, this.retryInterval || defaultRetryInterval);
    }

    let retryAttemptInternal = 1;
    if (retryAttempt !== undefined) {
      retryAttemptInternal = retryAttempt + 1;
    }

    const maxRetryAttempts = this.maxRetryAttempts || defaultMaxRetryAttempts;
    const maxRetryQueueSize = this.maxRetryQueueSize || defaultMaxRetryQueueSize;

    const promise = new Promise((resolve, reject) => {
      if (!SkillsConfiguration.getAuthToken() && !SkillsConfiguration.isPKIMode()) {
        skillsService.getAuthenticationToken(SkillsConfiguration.getAuthenticator(), SkillsConfiguration.getServiceUrl(), SkillsConfiguration.getProjectId())
          .then((token) => {
            SkillsConfiguration.setAuthToken(token);
            reportInternal(resolve, reject, userSkillId, timestamp, isRetry, retryAttemptInternal, maxRetryAttempts, maxRetryQueueSize, this.notifyIfSkillNotApplied);
          })
          .catch((err) => {
            if (retryAttemptInternal <= maxRetryAttempts) {
              addToRetryQueue(userSkillId, timestamp, retryAttemptInternal, null, maxRetryQueueSize);
            } else {
              log.warn(`Max retry attempts has been reached (${this.maxRetryAttempts}), Unable to retry skillId [${userSkillId}]`);
            }
            log.error(`SkillsReporter::Unable to retrieve auth token reporting skill [${userSkillId}]`);
            reject(err);
          });
      } else {
        reportInternal(resolve, reject, userSkillId, timestamp, isRetry, retryAttemptInternal, maxRetryAttempts, maxRetryQueueSize, this.notifyIfSkillNotApplied);
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
    if (retryIntervalId != null) {
      clearInterval(retryIntervalId);
      retryIntervalId = null;
    }
  },

};

SkillsConfiguration.afterConfigure().then(() => {
  connectWebsocket(SkillsConfiguration.getServiceUrl());
  if (!retryIntervalId) {
    log.info(`SkillsClient::SkillsReporter::Enabling retries. retryInterval [${SkillsReporter.retryInterval}]`);
    retryIntervalId = setInterval(() => { retryErrors.call(SkillsReporter); }, SkillsReporter.retryInterval || defaultRetryInterval);
  }
});

export {
  SkillsReporter,
  SUCCESS_EVENT,
  FAILURE_EVENT,
};
