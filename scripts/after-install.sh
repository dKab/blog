#!/bin/bash
cd /home/ubuntu/website/
npm instal
npm start
parameters=$(aws ssm get-parameters --region us-east-2 --names CLOUDFLARE_X_AUTH_KEY CLOUDFLARE_X_AUTH_EMAIL CLOUDFLARE_ZONE_ID --with-decryption)
PARAMETERS=$parameters node purge-cdn-cache.js