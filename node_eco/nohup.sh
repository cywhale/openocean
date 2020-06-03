#!/bin/bash
echo "#---------------------NODE ECO Start at $(date '+%Y%m%d %H:%M:%S')" 
vlog="nohup.out"
if ls "$vlog" 1> /dev/null 2>&1; then
  echo "#Warning: backup original nohup.out to ver_bak/log"
  mv "$vlog" "ver_bak/log/nohup_$(date '+%Y%m%d').log"
fi
export APP_SETTINGS_FILE_PATH="$HOME/git/openocean/node_eco/.config.app.json" && nohup npx nodemon --exec yarn start </dev/null &

