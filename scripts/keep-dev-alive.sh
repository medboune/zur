#!/bin/sh
# Keeps the Zuronix dev server (preview) alive: if nothing listens on :3000,
# start `next dev` again. Logs append to dev.log.
cd /home/z/my-project || exit 1
while true; do
  if ! lsof -i :3000 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "[keepalive] $(date '+%H:%M:%S') starting next dev" >> dev.log
    nohup npx next dev -p 3000 >> dev.log 2>&1 &
  fi
  sleep 10
done
