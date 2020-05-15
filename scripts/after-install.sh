#!/bin/bash
cd /home/ubuntu/website/
npm install
npm start
node purge-cdn.cache.js