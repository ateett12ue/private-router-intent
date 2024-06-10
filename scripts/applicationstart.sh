#!/bin/bash
cd /home/ubuntu/deploy/routerIntentBackend/
pm2 delete --silent service.routerIntentBackend
pm2 start ./dist/bin/www.js --name=service.routerIntentBackend
