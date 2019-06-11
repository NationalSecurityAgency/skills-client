import SkillsReporter from '@skills/skills-client-reporter';

const RESPONSE_EVENT = 'skills-report-response';

const eventListener = (el, skillId) => () => {
  SkillsReporter.reportSkill(skillId)
    .then((result) => {
      const event = new CustomEvent(RESPONSE_EVENT, { detail: result });
      el.dispatchEvent(event);
    })
    .catch((error) => {
      const event = new CustomEvent(RESPONSE_EVENT, { detail: error });
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
