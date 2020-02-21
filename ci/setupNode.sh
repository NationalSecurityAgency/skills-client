#!/usr/bin/env bash

cat /etc/os-release
curl -sL https://rpm.nodesource.com/setup_12.x | bash -
apt-get install -y nodejs
node -v
npm -v
