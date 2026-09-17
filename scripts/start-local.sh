#!/usr/bin/env sh

set -eu

# These defaults are intentionally development-only. Override any of them in
# your shell before starting the app when you need a different local setup.
export NODE_ENV="${NODE_ENV:-development}"
export DATABASE_URL="${DATABASE_URL:-postgresql://dante@127.0.0.1:5432/expo_miami_local}"
export JWT_SECRET="${JWT_SECRET:-local-development-secret-change-me}"
export ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-local-admin}"

api_port="${API_PORT:-8080}"
web_port="${WEB_PORT:-5173}"

cleanup() {
  kill "$api_pid" "$web_pid" 2>/dev/null || true
}

pnpm --filter @workspace/db run push

PORT="$api_port" pnpm --filter @workspace/api-server run dev &
api_pid=$!

PORT="$web_port" BASE_PATH="${BASE_PATH:-/}" API_PROXY_TARGET="http://127.0.0.1:$api_port" \
  pnpm --filter @workspace/expo-miami run dev &
web_pid=$!

trap cleanup INT TERM EXIT

wait "$api_pid" "$web_pid"
