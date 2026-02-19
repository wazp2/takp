#!/usr/bin/env bash
set -euo pipefail

TICK_SECONDS="${BACKGROUND_TICK_SECONDS:-60}"
if ! [[ "$TICK_SECONDS" =~ ^[0-9]+$ ]] || [ "$TICK_SECONDS" -lt 15 ]; then
  TICK_SECONDS=60
fi

mkdir -p /var/www/html/logs
touch /var/www/html/logs/background_worker.log

echo "[worker] started, interval=${TICK_SECONDS}s" >> /var/www/html/logs/background_worker.log

while true; do
  ts="$(date '+%Y-%m-%d %H:%M:%S')"
  if php /var/www/html/background_tick.php >> /var/www/html/logs/background_worker.log 2>&1; then
    echo "[worker] ${ts} tick ok" >> /var/www/html/logs/background_worker.log
  else
    echo "[worker] ${ts} tick failed" >> /var/www/html/logs/background_worker.log
  fi
  sleep "$TICK_SECONDS"
done

