import SkillsReporter from '@skills/skills-client-reporter';

const eventListener = skillId => () => {
  SkillsReporter.reportSkill(skillId);
};

const eventContext = {
  name: null,
  handler: null,
};

export default {
  name: 'skills',
  configure(serviceUrl, projectId, authenticationUrl) {
    SkillsReporter.initialize(serviceUrl, projectId, authenticationUrl);
  },
  inserted(el, binding) {
    eventContext.name = binding.arg ? binding.arg : 'click';
    eventContext.handler = eventListener(binding.value);
    el.addEventListener(eventContext.name, eventContext.handler);
  },
  unbind(el) {
    el.removeEventListener(eventContext.name, eventContext.handler);
  },
};
