#!/usr/bin/env bash

rm -rf skills-client-configuration
git clone https://${DEPLOYTOKEN_SKILLS_CONFIG}:${DEPLOYTOKEN_SKILLS_CONFIG_PASS}@gitlab.evoforge.org/skills/skills-client-configuration.git
rm -rf skills-client-reporter
git clone https://${DEPLOYTOKEN_SKILLS_REPORTER}:${DEPLOYTOKEN_SKILLS_REPORTER_PASS}@gitlab.evoforge.org/skills/skills-client-reporter.git
rm -rf skills-client-js
git clone https://${DEPLOYTOKEN_SKILLS_JS}:${DEPLOYTOKEN_SKILLS_JS_PASS}@gitlab.evoforge.org/skills/skills-client-js.git
rm -rf skills-client-vue
git clone https://${DEPLOYTOKEN_SKILLS_VUE}:${DEPLOYTOKEN_SKILLS_VUE_PASS}@gitlab.evoforge.org/skills/skills-client-vue.git
rm -rf skills-client-react
git clone https://${DEPLOYTOKEN_SKILLS_REACT}:${DEPLOYTOKEN_SKILLS_REACT_PASS}@gitlab.evoforge.org/skills/skills-client-react.git
