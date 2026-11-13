#!/bin/sh
# Keeps the Zuronix dev server (preview) alive: if the app no longer answers
# on :3000, start `next dev` again. Logs append to dev.log.
# NOTE: `lsof` cannot see listeners in this sandbox, so we probe with curl.
cd /home/z/my-project || exit 1
while true; do
  if ! curl -s -o /dev/null --max-time 5 http://localhost:3000/; then
    echo "[keepalive] $(date '+%H:%M:%S') starting next dev" >> dev.log
    nohup npx next dev -p 3000 >> dev.log 2>&1 &
    # give the fresh server time to boot before probing again
    sleep 30
  fi
  sleep 10
done
