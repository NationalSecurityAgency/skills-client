import SkillsReporter from '@skills/skills-client-reporter';

const SUCCESS_EVENT = 'skills-report-success';
const FAILURE_EVENT = 'skills-report-error';

const eventListener = (el, skillId) => () => {
  SkillsReporter.reportSkill(skillId)
    .then((result) => {
      const event = new CustomEvent(SUCCESS_EVENT, { detail: result });
      el.dispatchEvent(event);
    })
    .catch((error) => {
      const event = new CustomEvent(FAILURE_EVENT, { detail: error });
      el.dispatchEvent(event);
    });
};

const eventCache = new WeakMap();

export default {
  name: 'skills',
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
