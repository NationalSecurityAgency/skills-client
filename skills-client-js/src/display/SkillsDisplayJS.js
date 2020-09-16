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
import Postmate from 'postmate';
import axios from 'axios';
import log from 'js-logger';

import SkillsConfiguration from '../config/SkillsConfiguration';
import ErrorPageUtils from './ErrorPageUtils';
import skillsService from '../SkillsService';

let uniqueId = 0;

export default class SkillsDisplayJS {
  /* eslint-disable object-curly-newline */
  constructor({ options, theme, version, userId } = {}) {
    log.debug(`SkillsClient::SkillsDisplayJS::Constructing with options [${options}], theme [${theme}], version [${version}], userId [${userId}]`);
    this._validateOptions(options);
    this._options = { ...{ }, ...options };
    this._theme = theme;
    this._version = version;
    this._userId = userId;
  }

  /* eslint-disable class-methods-use-this */
  currentIframeId() {
    return uniqueId;
  }

  attachTo(selectorOrElement) {
    log.info(`SkillsClient::SkillsDisplayJS::attaching to [${selectorOrElement}]`);
    let iframeContainer = selectorOrElement;
    if (typeof selectorOrElement === 'string') {
      iframeContainer = document.querySelector(selectorOrElement);
      log.debug(`SkillsClient::SkillsDisplayJS::document.querySelector returned [${iframeContainer}]`);
    }
    if (!iframeContainer) {
      throw new Error(`Can't find element with selector='${selectorOrElement}'`);
    }

    uniqueId += 1;
    const className = `client-display-iframe-${uniqueId}`;

    const minHeight = this.options.isSummaryOnly ? 600 : 960;
    const handshake = new Postmate({
      container: iframeContainer,
      url: `${this.configuration.serviceUrl}/static/clientPortal/index.html`,
      classListArray: [className],
      model: {
        serviceUrl: this.configuration.serviceUrl,
        projectId: this.configuration.projectId,
        version: this.version,
        userId: this.configuration.authenticator === 'pki' ? this.userId : null,
        theme: this.theme,
        minHeight: `${minHeight}px`,
        isSummaryOnly: this.options.isSummaryOnly,
      },
    });
    const iframe = document.querySelector(`.${className}`);
    iframe.setAttribute('style', 'border: 0; height: 100%; width: 100%');

    iframeContainer.height = 0;
    iframeContainer.style.height = '0px';

    handshake.then((child) => {
      this._childFrame = child;
      child.on('height-changed', (data) => {
        log.debug(`SkillsClient::SkillsDisplayJS::height-changed: data [${data}]`);
        const adjustedHeight = Math.max(data, minHeight);
        iframeContainer.height = adjustedHeight;
        iframeContainer.style.height = `${adjustedHeight}px`;
      });
      child.on('route-changed', () => {
        log.debug('SkillsClient::SkillsDisplayJS::route-changed');
        if (!this.options.disableAutoScroll) {
          let scrollToElement = iframeContainer;

          if (this.options.autoScrollStrategy === 'top-offset') {
            let providedOffset = 0;
            if (this.options.scrollTopOffset) {
              providedOffset = this.options.scrollTopOffset;
            }
            const scrollToOffset = scrollToElement.offsetTop - providedOffset;
            window.scroll({ top: scrollToOffset, behavior: 'smooth' });
          } else {
            if (this.options.autoScrollStrategy === 'top-of-page') {
              scrollToElement = document.querySelector('body');
            }
            scrollToElement.scrollIntoView({
              behavior: 'smooth',
            });
          }
        }
      });
      child.on('needs-authentication', () => {
        log.debug('SkillsClient::SkillsDisplayJS::needs-authentication');
        const isPkiMode = this.configuration.authenticator === 'pki';
        if (!this.authenticationPromise && !isPkiMode) {
          this.authenticationPromise = axios.get(this.configuration.authenticator)
            .then((result) => {
              child.call('updateAuthenticationToken', result.data.access_token);
            })
            .finally(() => {
              this.authenticationPromise = null;
            });
        } else if (isPkiMode) {
          child.call('updateAuthenticationToken', 'pki');
        }
      });
    });

    log.debug('SkillsClient::SkillsDisplayJS::calling _checkAndHandleServiceStatus');
    this._checkAndHandleServiceStatus(iframeContainer);
  }

  _checkAndHandleServiceStatus(iframeContainer) {
    if (!SkillsConfiguration.getServiceStatus()) {
      log.info('SkillsClient::SkillsDisplayJS::SkillsConfiguration.configure() was not called, checking status endpoint.');
      skillsService.getServiceStatus(`${this.configuration.serviceUrl}/public/status`)
        .catch((error) => {
          let errorMessage = 'Please ensure the skilltree server is running';
          if (this.configuration.serviceUrl && this.configuration.serviceUrl.startsWith('https')) {
            errorMessage += ' and that your browser trusts the server\'s certificate';
          }
          errorMessage += `. skilltree service URL: ${this.configuration.serviceUrl}`;
          /* eslint-disable no-console */
          console.error(errorMessage);
          log.error(`SkillsClient::SkillsDisplayJS::${errorMessage}`, error);
          ErrorPageUtils.removeAllChildren(iframeContainer);
          iframeContainer.appendChild(ErrorPageUtils.buildErrorPage());
          iframeContainer.setAttribute('style', 'border: 5px; height: 20rem; width: 100%');
        });
    }
  }

  set version(version) {
    log.info(`SkillsClient::SkillsDisplayJS::setting version [${version}]`);
    this._version = version;
    this._childFrame.call('updateVersion', version);
  }

  get options() {
    return this._options;
  }

  get theme() {
    return this._theme;
  }

  get version() {
    return this._version;
  }

  get userId() {
    return this._userId;
  }

  get configuration() {
    const serviceUrl = this._options.serviceUrl ? this._options.serviceUrl : SkillsConfiguration.getServiceUrl();
    const authenticator = this._options.authenticator ? this._options.authenticator : SkillsConfiguration.getAuthenticator();
    const projectId = this._options.projectId ? this._options.projectId : SkillsConfiguration.getProjectId();
    return { serviceUrl, authenticator, projectId };
  }

  _validateOptions(options) {
    const configOptions = [
      'authenticator',
      'serviceUrl',
      'projectId',
      'disableAutoScroll',
      'autoScrollStrategy',
      'isSummaryOnly',
      'scrollTopOffset',
    ];
    const toTest = { ...this._options, ...options };
    const passedOptions = Object.keys(toTest);
    const invalidOption = passedOptions.find((passedOption) => !configOptions.includes(passedOption));
    if (invalidOption) {
      throw new Error(`Invalid option passed to SkillsDisplayJS ["${invalidOption}"]`);
    }
  }

  destroy() {
    log.info(`SkillsClient::SkillsDisplayJS::destroy called. _childFrame [${this._childFrame}]`);
    if (this._childFrame) {
      this._childFrame.destroy();
    }
  }
}
