import Postmate from 'postmate';
import axios from 'axios';

import SkillsConfiguration from '@skills/skills-client-configuration';

let uniqueId = 0;

export default class SkillsDisplayJS {
  constructor({
    options,
    theme,
    version,
    userId,
  }) {
    this._validateOptions(options);
    this._options = { ...{ }, ...options };
    this._theme = theme;
    this._version = version;
    this._userId = userId;
  }

  attachTo(selectorOrElement) {
    let iframeContainer = selectorOrElement;
    if (typeof selectorOrElement === 'string') {
      iframeContainer = document.querySelector(selectorOrElement);
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
        const adjustedHeight = Math.max(data, minHeight);
        iframeContainer.height = adjustedHeight;
        iframeContainer.style.height = `${adjustedHeight}px`;
      });
      child.on('route-changed', () => {
        if (!this.options.disableAutoScroll) {
          let scrollToElement = iframeContainer;
          if (this.options.autoScrollStrategy === 'top-of-page') {
            scrollToElement = document.querySelector('body');
          }

          scrollToElement.scrollIntoView({ behavior: 'smooth' });
        }
      });
      child.on('needs-authentication', () => {
        if (!this.authenticationPromise && this.configuration.authenticator !== 'pki') {
          this.authenticationPromise = axios.get(this.configuration.authenticator)
            .then((result) => {
              child.call('updateAuthenticationToken', result.data.access_token);
            })
            .finally(() => {
              this.authenticationPromise = null;
            });
        } else if (this.configuration.authenticator === 'pki') {
          child.call('updateAuthenticationToken', 'pki');
        }
      });
    });
  }

  set version(version) {
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
    ];
    const toTest = { ...this._options, ...options };
    const passedOptions = Object.keys(toTest);
    const invalidOption = passedOptions.find((passedOption) => !configOptions.includes(passedOption));
    if (invalidOption) {
      throw new Error(`Invalid option passed to SkillsDisplayJS ["${invalidOption}"]`);
    }
  }

  destroy() {
    this._childFrame.destroy();
  }
}
