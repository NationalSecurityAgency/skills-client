import { SkillsReporter, SUCCESS_EVENT, FAILURE_EVENT } from '@skills/skills-client-reporter';

import debounce from 'lodash/debounce';

const eventCache = new WeakMap();

const eventListener = (el, skillId) => {
  return debounce(() => {
    SkillsReporter.reportSkill(skillId)
      .then((result) => {
        const event = new CustomEvent(SUCCESS_EVENT, { detail: result });
        el.dispatchEvent(event);
      })
      .catch((error) => {
        const event = new CustomEvent(FAILURE_EVENT, { detail: error });
        el.dispatchEvent(event);
      });
  }, 500)
};

export default {
  name: 'skills',
  addSuccessHandler(handler) {
    SkillsReporter.addSuccessHandler(handler);
  },
  addErrorHandler(handler) {
    SkillsReporter.addErrorHandler(handler);
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
