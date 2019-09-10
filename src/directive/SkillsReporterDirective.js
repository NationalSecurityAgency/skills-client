import SkillsReporter from '@skills/skills-client-reporter';

import debounce from 'lodash/debounce';

const SUCCESS_EVENT = 'skills-report-success';
const FAILURE_EVENT = 'skills-report-error';

const successHandlerCache = new Set();
const errorHandlerCache = new Set();
const eventCache = new WeakMap();

const callSuccessHandlers = (event) => {
  successHandlerCache.forEach(it => it(event));
};

const callErrorHandlers = (event) => {
  errorHandlerCache.forEach(it => it(event));
};

const eventListener = (el, skillId) => {
  return debounce(() => {
    SkillsReporter.reportSkill(skillId)
      .then((result) => {
        const event = new CustomEvent(SUCCESS_EVENT, { detail: result });
        callSuccessHandlers(event);
        el.dispatchEvent(event);
      })
      .catch((error) => {
        const event = new CustomEvent(FAILURE_EVENT, { detail: error });
        callErrorHandlers(event);
        el.dispatchEvent(event);
      });
  }, 500)
};

export default {
  name: 'skills',
  addSuccessHandler(handler) {
    successHandlerCache.add(handler);
  },
  addErrorHandler(handler) {
    errorHandlerCache.add(handler);
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
    setTimeout(() => {
      el.removeEventListener(eventContext.name, eventContext.handler);
      eventCache.delete(el);
    });
  },
};
