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
# exit if a command returns non-zero exit code
set -e
set -o pipefail

echo "------- START: Setup npm links -------"
cd skills-client-integration/skills-int-e2e-test
mvn --batch-mode clean package
ls target/skills-int-e2e-test-*.jar
ll target/skills-int-e2e-test-*.jar
java -cp target/skills-int-e2e-test-*.jar -Dloader.main=skills.SetupNpmLinks org.springframework.boot.loader.PropertiesLauncher
cd ../../
echo "------- DONE: Setup npm links -------"
