#!/bin/bash
cd /home/ubuntu/deployment/website/
npm install
npm start
rm -rf /home/ubuntu/deployment/website/node_modules
rm -rf /home/ubuntu/website
mv /home/ubuntu/deployment/website /home/ubuntu
cd /home/ubuntu/website
parameters=$(aws ssm get-parameters --region us-east-2 --names CLOUDFLARE_X_AUTH_KEY CLOUDFLARE_X_AUTH_EMAIL CLOUDFLARE_ZONE_ID --with-decryption)
PARAMETERS=$parameters node purge-cdn-cache.js