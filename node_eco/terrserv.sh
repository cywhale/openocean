#!/bin/bash
echo "#---------------------Cessium Terrain server Start at $(date '+%Y%m%d %H:%M:%S')"
nohup cesium-terrain-server -dir /home/odbadmin/docker/data/tilesets/terrain -port 8038 -pemPath /home/odbadmin/docker/data/tilesets -https true -log-level crit >/dev/null 2>&1 &

