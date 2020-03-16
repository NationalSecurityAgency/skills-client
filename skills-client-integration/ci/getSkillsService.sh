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

echo "------- START: Download Latest Backend Jar -------"
# exit if a command returns non-zero exit code
set -e
set -o pipefail

apt-get install -y gawk

# on CI server this will be a detached repo and won't have branch info, so the current commit must be matched against server
myGitBranch=`git ls-remote --heads origin | grep $(git rev-parse HEAD) | gawk -F'refs/heads/' '{print $2}'`
echo "My Git Branch: [${myGitBranch}]"

echo "Checkout skill-service code and build it."
git clone https://${DEPLOY_TOKEN_SKILLS_SERVICE}:${DEPLOY_TOKEN_SKILLS_SERVICE_PASS}@gitlab.evoforge.org/skills/skills-service.git
cd ./skills-service/

switchToBranch=$BRANCH_TO_DEPLOY_SKILLS_SERVICE
matchingBranch=`git branch -a | grep "* ${myGitBranch}" | gawk '{print $2}'`
if [[ "$myGitBranch" == *\.X ]] || [[ "$myGitBranch" == "master" ]] || [[ -z "$matchingBranch" ]]
then
    echo "Building from skill-service from configured [${switchToBranch}] branch"
else
    switchToBranch=matchingBranch
    echo "Found matching branch [${switchToBranch}]"
fi

if [[ -z "$switchToBranch" ]]
then
    exit -1
fi

echo "Checking out [${switchToBranch}]"
git checkout ${switchToBranch} --

echo "git status:"
git status

mvn --batch-mode package -DskipTests
jar=$(ls ./backend/target/*.jar)
mv $jar ./

cd ../
echo "------- DONE: Download Latest Backend Jar -------"
