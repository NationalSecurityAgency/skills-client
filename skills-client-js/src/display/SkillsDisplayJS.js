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
import log from 'js-logger';
import { createBrowserHistory } from 'history';

import SkillsConfiguration from '../config/SkillsConfiguration';
import ErrorPageUtils from './ErrorPageUtils';
import skillsService from '../SkillsService';

let uniqueId = 0;
let history = null; // createBrowserHistory();
let unlisten = () => {};

const skillsClientDisplayPath = 'skillsClientDisplayPath';
const POP = 'POP';

export default class SkillsDisplayJS {
  /* eslint-disable object-curly-newline */
  constructor({ options, theme, version, handleRouteChanged, userId } = {}) {
    log.debug(`SkillsClient::SkillsDisplayJS::Constructing with options [${options}], theme [${theme}], version [${version}], userId [${userId}]`);
    this._validateOptions(options);
    this._options = { ...{ }, ...options };
    this._theme = theme;
    this._version = version;
    this._handleRouteChanged = handleRouteChanged;
    this._userId = userId;
  }

  /* eslint-disable class-methods-use-this */
  currentIframeId() {
    return uniqueId;
  }

  attachTo(selectorOrElement) {
    log.info(`SkillsClient::SkillsDisplayJS::attaching to [${selectorOrElement ? selectorOrElement.toString() : selectorOrElement}]`);
    let iframeContainer = selectorOrElement;
    if (typeof selectorOrElement === 'string') {
      iframeContainer = document.querySelector(selectorOrElement);
      log.debug(`SkillsClient::SkillsDisplayJS::document.querySelector returned [${iframeContainer ? iframeContainer.toString() : iframeContainer}]`);
    }
    if (!iframeContainer) {
      throw new Error(`Can't find element with selector='${selectorOrElement ? selectorOrElement.toString() : selectorOrElement}'`);
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
        internalBackButton: this.options.internalBackButton,
      },
    });
    const iframe = document.querySelector(`.${className}`);
    iframe.setAttribute('style', 'border: 0; height: 100%; width: 100%');

    iframeContainer.height = 0;
    iframeContainer.style.height = '0px';

    const updateChildRoute = (previousLocation = this.skillsDisplayPath, skipParentHistory = true, replace = true) => {
      if (this._childFrame && !(previousLocation == null)) {
        this._childFrame.call('navigate', { path: previousLocation, replace, query: { skipParentHistory } });
      }
    };
    history = createBrowserHistory();
    // Listen for changes to the current location from the back/forward browser buttons.
    unlisten = history.listen(({ action }) => {
      if (action === POP) {
        updateChildRoute(this.skillsDisplayPath || '/', true);
      }
    });

    handshake.then((child) => {
      this._childFrame = child;
      child.on('height-changed', (data) => {
        log.debug(`SkillsClient::SkillsDisplayJS::height-changed: data [${data}]`);
        const adjustedHeight = Math.max(data, minHeight);
        iframeContainer.height = adjustedHeight;
        iframeContainer.style.height = `${adjustedHeight}px`;
      });
      child.on('route-changed', (params) => {
        const newPath = params.path;
        log.debug(`SkillsClient::SkillsDisplayJS::route-changed - newPath [${newPath}]`);
        if (!(newPath == null)) {
          const routePath = newPath.endsWith('index.html') ? '/' : newPath;
          if (this._shouldUpdateHistory(params)) {
            // put the new path in the URL so that when the page is reloaded or
            // sent as a link the proper route will be set in the child iframe
            const queryParams = new URLSearchParams(window.location.search);
            queryParams.set(skillsClientDisplayPath, routePath);
            const newUrl = `${window.location.pathname}?${queryParams.toString()}${window.location.hash}`;
            history.push(newUrl, { skillsClientDisplayPath: newPath });
          }

          // if the client has configured a handleRouteChanged call back, invoke it
          if (this._handleRouteChanged) {
            this._handleRouteChanged(routePath);
          }
        }

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
          this.authenticationPromise = skillsService.getAuthenticationToken(this.configuration.authenticator, this.configuration.serviceUrl, this.configuration.projectId)
            .then((result) => {
              child.call('updateAuthenticationToken', result);
              updateChildRoute();
            })
            .finally(() => {
              this.authenticationPromise = null;
            });
        } else if (isPkiMode) {
          child.call('updateAuthenticationToken', 'pki');
          updateChildRoute();
        }
      });
    });

    log.debug('SkillsClient::SkillsDisplayJS::calling _checkAndHandleServiceStatus');
    this._checkAndHandleServiceStatus(iframeContainer);
  }

  _checkAndHandleServiceStatus(iframeContainer) {
    this.status = SkillsConfiguration.getServiceStatus();
    if (!this.status) {
      log.info('SkillsClient::SkillsDisplayJS::SkillsConfiguration.configure() was not called, checking status endpoint.');
      skillsService.getServiceStatus(`${this.configuration.serviceUrl}/public/status`).then((response) => {
        this.status = response.status;
        skillsService.configureLogging(this, response);
      }).catch((error) => {
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

  _shouldUpdateHistory(params) {
    // if the query param `skipParentHistory` is true then do not update the history (set to true when the user is navigating with the back/forward browser buttons)
    const updateHistoryParam = (params.query.skipParentHistory !== 'true' && params.query.skipParentHistory !== true);
    // also, allow the client app to disable this feature, but enable it by default
    const updateHistoryOption = this.options.updateHistory == null || this.options.updateHistory === true;
    return updateHistoryOption && updateHistoryParam;
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

  get skillsDisplayPath() {
    const urlParams = new URLSearchParams(window.location.search);
    const clientDisplayPath = urlParams.get(skillsClientDisplayPath);
    return clientDisplayPath;
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
      'internalBackButton',
      'updateHistory',
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
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.delete(skillsClientDisplayPath);
    unlisten();
  }
}
