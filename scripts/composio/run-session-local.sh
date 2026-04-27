#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${COMPOSIO_API_KEY:-}" ]]; then
  read -rsp "COMPOSIO_API_KEY: " COMPOSIO_API_KEY
  echo
  export COMPOSIO_API_KEY
fi

export COMPOSIO_USER_ID="${COMPOSIO_USER_ID:-thiagaoai-local}"

node scripts/composio/create-session.mjs
