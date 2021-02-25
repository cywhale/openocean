#!/bin/bash
echo "#---------------------NODE ECO Start at $(date '+%Y%m%d %H:%M:%S')"
vlog="nohup.out"
if ls "$vlog" 1> /dev/null 2>&1; then
  echo "#Warning: backup original nohup.out to ver_bak/log"
  today=$(date +%Y%m%d)
  mv "$vlog" "ver_bak/log/nohup_$today.log"

  if ls "$vlog".* 1> /dev/null 2>&1; then
#   echo "#Warning: backup additional original nohup.out.* to ver_bak/log"
    for file in "$vlog".*; do mv "$file" "ver_bak/log/${file%.out%}"_$today.log; done
  fi

fi
##export APP_SETTINGS_FILE_PATH="$HOME/git/openocean/node_eco/.config.app.json" &&
export NODE_ENV="production" && nohup npx nodemon --exec yarn start </dev/null &

