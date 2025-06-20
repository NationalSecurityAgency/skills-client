# Copyright 2025 SkillTree
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
#cd skills-client-integration/skills-int-e2e-test
#mvn --batch-mode clean package -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=warn
#ls -la target/skills-int-e2e-test-*.jar
#du -sh target/*
#java --version
#java -cp target/skills-int-e2e-test-*.jar -Dloader.main=skills.SetupNpmLinks org.springframework.boot.loader.launch.PropertiesLauncher
#cd ../../

cd skills-client-js
echo "------- skills-client-js: npm link -------"
npm link
cd ../skills-client-integration/skills-int-client-js/
echo "------- skills-int-client-js: npm link @skilltree/skills-client-js -------"
npm link @skilltree/skills-client-js

cd ../../skills-client-js
echo "------- skills-client-js: npm install -------"
npm install
echo "------- skills-int-client-js: npm install -------"
cd ../skills-client-integration/skills-int-client-js/
npm install

echo "------- validate npm links -------"
if ! npm ls --link --global | grep -q "skills-client-js@3.6.1"; then
    echo "Error: skills-client-js@3.6.1 is not properly linked"
    exit 1
else
    echo "Verified: skills-client-js@3.6.1 is properly linked"
fi

echo "------- skills-int-client-js: npm run build -------"
npm run build

echo "------- DONE: Setup npm links -------"
