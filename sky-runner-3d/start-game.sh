#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PORT="${1:-8080}"
URL="http://localhost:${PORT}/"

echo "Starting Sky Runner 3D on ${URL}"
echo "Press Ctrl+C to stop."

if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server "$PORT" >/tmp/sky-runner-3d.log 2>&1 &
elif command -v python >/dev/null 2>&1; then
  python -m http.server "$PORT" >/tmp/sky-runner-3d.log 2>&1 &
else
  echo "Python is required but was not found."
  exit 1
fi

SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT

sleep 1

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then
  open "$URL" >/dev/null 2>&1 || true
fi

wait "$SERVER_PID"
