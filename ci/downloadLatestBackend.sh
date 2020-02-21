#!/usr/bin/env bash

majorVersion=1.1
latestSnapVersion=`curl -s http://$NEXUS_SERVER/repository/maven-snapshots/skills/backend/maven-metadata.xml | grep "<version>${majorVersion}" | gawk -F "version>" '{print $2}' | gawk -F "<" '{print $1}' | sort | tac  | head -n 1`

if [ -z "$latestSnapVersion" ]
then
      echo "Failed to locate SNAPSHOT version that start with ${1}"
      exit -1
fi

mvn --batch-mode dependency:get -Dartifact=skills:backend:${latestSnapVersion}:jar -Dtransitive=false -Ddest=backend-toTest.jar
