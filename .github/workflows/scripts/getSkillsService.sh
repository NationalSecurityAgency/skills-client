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

echo "------- START: Build skills-service jar -------"
# exit if a command returns non-zero exit code
set -e
#set -o pipefail

git branch
git branch | grep \* | awk '{print $2}'
myGitBranch=`git branch | grep \* | awk '{print $2}'`
echo "My Git Branch: [${myGitBranch}]"

echo "Checkout skill-service code and build it."
git clone https://github.com/NationalSecurityAgency/skills-service.git
cd ./skills-service/

switchToBranch="master"
echo "Default branch to consider [${myGitBranch}]"
matchingBranch=`git branch -a | grep "remotes/origin/${myGitBranch}" | gawk -F'remotes/origin/' '{print $2}' | cat`
echo "Matching branch to consider [${matchingBranch}]"
if [[ "$myGitBranch" == *\.X ]] || [[ "$myGitBranch" == "master" ]] || [[ -z "$matchingBranch" ]]
then
    echo "Building skill-service from [master] branch"
else
    switchToBranch=$matchingBranch
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
jar=$(ls ./service/target/*.jar)
mv $jar ./

cd ../
echo "------- DONE: Build skills-service jar -------"
