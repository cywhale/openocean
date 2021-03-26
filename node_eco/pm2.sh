#!/bin/bash
echo "#---------------------NODE ECO Start at $(date '+%Y%m%d %H:%M:%S')"
export NODE_ENV="production" && NODE_PORT=3000 pm2 start -i 2 server/server.js

