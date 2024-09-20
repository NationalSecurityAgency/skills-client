const Environment = require('jest-environment-jsdom').TestEnvironment;

/**
 * A custom environment to set the TextEncoder that is required by @stomp/stompjs.
 */
module.exports = class CustomTestEnvironment extends Environment {
  constructor(config, context) {
    super(config, context);
  }

  async setup() {
    await super.setup();
    if (typeof this.global.TextEncoder === 'undefined') {
      const { TextEncoder } = require('util');
      this.global.TextEncoder = TextEncoder;
    }
    if (typeof this.global.TextDecoder === 'undefined') {
      const { TextDecoder } = require('util');
      this.global.TextDecoder = TextDecoder;
    }
  }
}