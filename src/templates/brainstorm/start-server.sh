#!/usr/bin/env bash
# REAP Visual Companion — Server Start Script
# Usage: start-server.sh [--project-dir /path/to/project] [--port 3210] [--foreground]

set -e

PROJECT_DIR="$(pwd)"
PORT="${BRAINSTORM_PORT:-3210}"
FOREGROUND=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-dir) PROJECT_DIR="$2"; shift 2 ;;
    --port) PORT="$2"; shift 2 ;;
    --foreground) FOREGROUND=true; shift ;;
    *) shift ;;
  esac
done

SCREEN_DIR="${PROJECT_DIR}/.reap/brainstorm"
SERVER_INFO="${SCREEN_DIR}/.server-info"
SERVER_STOPPED="${SCREEN_DIR}/.server-stopped"

# Find server.cjs relative to this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_JS="${SCRIPT_DIR}/server.cjs"

# Ensure screen directory exists
mkdir -p "${SCREEN_DIR}"

# Remove stale stopped marker
rm -f "${SERVER_STOPPED}"

# Check if already running
if [ -f "${SERVER_INFO}" ]; then
  PID=$(node -e "try{console.log(JSON.parse(require('fs').readFileSync('${SERVER_INFO}','utf-8')).pid)}catch(e){console.log('')}")
  if [ -n "${PID}" ] && kill -0 "${PID}" 2>/dev/null; then
    echo "[brainstorm] Server already running (PID: ${PID})"
    cat "${SERVER_INFO}"
    exit 0
  fi
  # Stale info file
  rm -f "${SERVER_INFO}"
fi

export BRAINSTORM_PORT="${PORT}"
export BRAINSTORM_DIR="${SCREEN_DIR}"

if [ "${FOREGROUND}" = true ]; then
  exec node "${SERVER_JS}"
else
  nohup node "${SERVER_JS}" > "${SCREEN_DIR}/.server.log" 2>&1 &
  NOHUP_PID=$!

  # Wait for server-info to appear (max 5 seconds)
  for i in $(seq 1 50); do
    if [ -f "${SERVER_INFO}" ]; then
      echo "[brainstorm] Server started."
      cat "${SERVER_INFO}"
      exit 0
    fi
    sleep 0.1
  done

  echo "[brainstorm] Warning: server may have failed to start. Check ${SCREEN_DIR}/.server.log"
  exit 1
fi
