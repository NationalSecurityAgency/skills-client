#!/usr/bin/env bash

echo "@skills:registry=http://$NEXUS_SERVER/repository/skills-registry/" > ~/.npmrc
cat ~/.npmrc
cat e2e-tests/serverConfigs/settings.xml | sed s/NEXUS_SERVER/$NEXUS_SERVER/ > ~/.m2/settings.xml
cat ~/.m2/settings.xml
