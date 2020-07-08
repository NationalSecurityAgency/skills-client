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
echo "------- START: Run Cypress Tests -------"
# exit if a command returns non-zero exit code
set -e
set -o pipefail

cd skills-client-integration/skills-int-e2e-test
npm install

# start services and wait
npm run cyServices:start:skills-service:ci
npm run cyServices:start:integration-apps

# run tests
npm run cy:run

npm run cyServices:kill
cd ../../
echo "------- DONE: Run Cypress Tests -------"

