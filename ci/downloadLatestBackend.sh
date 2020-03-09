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

apt-get install -y gawk

majorVersion=1.1
latestSnapVersion=`curl -s http://$NEXUS_SERVER/repository/maven-snapshots/skills/backend/maven-metadata.xml | grep "<version>${majorVersion}" | gawk -F "version>" '{print $2}' | gawk -F "<" '{print $1}' | sort | tac  | head -n 1`

if [ -z "$latestSnapVersion" ]
then
      echo "Failed to locate SNAPSHOT version that start with ${1}"
      exit -1
fi

mvn --batch-mode dependency:get -Dartifact=skills:backend:${latestSnapVersion}:jar -Dtransitive=false -Ddest=backend-toTest.jar
