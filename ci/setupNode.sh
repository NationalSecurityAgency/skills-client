#!/usr/bin/env bash

cat /etc/os-release
curl -sL https://deb.nodesource.com/setup_13.x | bash -
apt-get install -y nodejs
node -v
npm -v
