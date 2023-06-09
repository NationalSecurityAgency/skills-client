#!/usr/bin/env bash

echo "------ Changing to skills-client-ng folder ------"
cd ../../skills-client-ng
ls
echo "------ Installing... ------"
npm install
npm run build
echo "------ Preparing link ------"
cd dist/skilltree/skills-client-ng
npm unlink
npm link
echo "------ Switching to integration client ------"
cd ../../../../skills-client-integration/skills-int-client-ng/
ls
echo "------ Creating link ------"
npm link @skilltree/skills-client-ng
echo "------ Installing integration ------"
npm install
npm run build
