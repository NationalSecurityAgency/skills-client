# Copyright 2020 SkillTree
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
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
