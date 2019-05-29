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
  configure(serviceUrl, projectId, authenticationToken) {
    SkillsReporter.initialize(serviceUrl, projectId, authenticationToken);
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
