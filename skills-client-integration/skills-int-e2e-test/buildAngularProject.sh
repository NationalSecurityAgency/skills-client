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

cd ../../skills-client-ng
echo "------ Installing... ------"
npm install
npm run build
echo "------ Preparing link ------"
cd dist/skilltree/skills-client-ng
echo "------ Unlinking current version ------"
npm unlink
echo "------ Creating new link ------"
npm link
echo "------ Switching to integration client ------"
cd ../../../../skills-client-integration/skills-int-client-ng/
echo "------ Removing old link ------"
npm unlink @skilltree/skills-client-ng
echo "------ Creating link ------"
npm link @skilltree/skills-client-ng
echo "------ Installing integration ------"
npm install
npm run build
