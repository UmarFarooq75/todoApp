#!/usr/bin/env bash
set -euo pipefail
URL="http://localhost:3001/api/health"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || true)
if [[ "$STATUS" == "200" ]]; then
  osascript -e 'display notification "Health check returned 200" with title "todoApp: HEALTHY"'
fi
