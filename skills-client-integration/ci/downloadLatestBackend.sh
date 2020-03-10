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

apt-get install -y gawk

# on CI server this will be a detached repo and won't have branch info, so the current commit must be matched against server
myGitBranch=`git ls-remote --heads origin | grep $(git rev-parse HEAD) | gawk -F'refs/heads/' '{print $2}'`
echo "My Git Branch: [${myGitBranch}]"

majorVersion=''
if [ "${myGitBranch}" != "master" ]
then
    majorVersion=`echo ${myGitBranch} | gawk -F "." '{print $1"."$2}'`
fi
echo "Version to look for is [${majorVersion}], if blank then latest version will be used!"
latestSnapVersion=`curl -s http://$NEXUS_SERVER/repository/maven-snapshots/skills/backend/maven-metadata.xml | grep "<version>${majorVersion}" | gawk -F "version>" '{print $2}' | gawk -F "<" '{print $1}' | sort | tac  | head -n 1`
echo "Latest snapshot version: [${latestSnapVersion}]"

if [ -z "$latestSnapVersion" ]
then
    echo "Failed to locate SNAPSHOT on nexus. Let's checkout skill-service code and build it ourselves."
    git clone https://${DEPLOY_TOKEN_SKILLS_SERVICE}:${DEPLOY_TOKEN_SKILLS_SERVICE_PASS}@gitlab.evoforge.org/skills/skills-service.git
    cd ./skills-service/
    switchToBranch=`git branch -a | grep ${myGitBranch}`
    if [ -z "$switchToBranch" ]
    then
        echo "Building from skill-service master branch"
    else
        echo "Building from skill-service ${switchToBranch} branch"
    fi
    git checkout ${switchToBranch}
    mvn --batch-mode package -DskipTests
else
    mkdir -p ./skills-service/
    cd ./skills-service/
    mvn --batch-mode dependency:get -Dartifact=skills:backend:${latestSnapVersion}:jar -Dtransitive=false -Ddest=backend-toTest.jar
fi

cd ../
echo "------- DONE: Download Latest Backend Jar -------"
