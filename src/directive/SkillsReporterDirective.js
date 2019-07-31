import SkillsReporter from '@skills/skills-client-reporter';

import debounce from 'lodash/debounce';

const CONFIGURATION_OPTIONS = {
  globalSuccessHandler: 'globalSuccessHandler',
  globalErrorHandler: 'globalErrorHandler'
};
const SUCCESS_EVENT = 'skills-report-success';
const FAILURE_EVENT = 'skills-report-error';

const eventCache = new WeakMap();
const globalConfiguration = { };

const hasGlobalSuccessHandlerConfigured = () => globalConfiguration[CONFIGURATION_OPTIONS.globalSuccessHandler];
const hasGlobalErrorHandlerConfigured = () => globalConfiguration[CONFIGURATION_OPTIONS.globalSuccessHandler];

const eventListener = (el, skillId) => {
  return debounce(() => {
    SkillsReporter.reportSkill(skillId)
      .then((result) => {
        const event = new CustomEvent(SUCCESS_EVENT, { detail: result });
        if (hasGlobalSuccessHandlerConfigured()) {
          globalConfiguration[CONFIGURATION_OPTIONS.globalSuccessHandler](event);
        }
        el.dispatchEvent(event);
      })
      .catch((error) => {
        const event = new CustomEvent(FAILURE_EVENT, { detail: error });
        if (hasGlobalErrorHandlerConfigured()) {
          globalConfiguration[CONFIGURATION_OPTIONS.globalErrorHandler](event);
        }
        el.dispatchEvent(event);
      });
  }, 500)
};

export default {
  name: 'skills',
  configure(options) {
    const validOptions = Object.values(CONFIGURATION_OPTIONS);
    Object.keys(options).forEach((option) => {
      if (!validOptions.includes(option)) {
        throw new Error(`Invalid option passed to the SkillsReporterDirective option=[${option}]\nValid options are [${validOptions.join(', ')}]`);
      }
      globalConfiguration[option] = options[option];
    });
  },
  inserted(el, binding) {
    const eventContext = {
      name: binding.arg ? binding.arg : 'click',
      handler: eventListener(el, binding.value),
    };
    el.addEventListener(eventContext.name, eventContext.handler);
    eventCache.set(el, eventContext);
  },
  unbind(el) {
    const eventContext = eventCache.get(el);
    el.removeEventListener(eventContext.name, eventContext.handler);
    eventCache.delete(el);
  },
};
