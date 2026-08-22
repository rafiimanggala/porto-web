#!/usr/bin/env bash
# Deploy to Vercel production and keep the clean aliases pointed at the new
# deployment. Resolves the latest READY production deployment via the API
# (the CLI prints JSON, which is awkward to parse), then re-aliases.
set -euo pipefail

CFG="$HOME/Library/Application Support/com.vercel.cli"
TOKEN="$(python3 -c "import json;print(json.load(open('$CFG/auth.json'))['token'])")"
TEAM="$(python3 -c "import json;print(json.load(open('$CFG/config.json')).get('currentTeam',''))")"
PRJ="prj_kARRkD1uyrWkCEHbnvGumxP02AVM"

echo "› deploying to production..."
vercel --prod --yes >/dev/null 2>&1

# The CLI can return before the API reports READY, so poll instead of
# assuming the first query already sees the new deployment.
LATEST=""
for _ in $(seq 1 30); do
  LATEST="$(curl -s "https://api.vercel.com/v6/deployments?projectId=$PRJ&target=production&state=READY&limit=1&teamId=$TEAM" \
    -H "Authorization: Bearer $TOKEN" \
    | python3 -c "import sys,json;d=json.load(sys.stdin).get('deployments') or [];print(d[0]['url'] if d else '')")"
  [ -n "$LATEST" ] && break
  sleep 4
done
if [ -z "$LATEST" ]; then
  echo "✗ no READY production deployment surfaced after 2 minutes" >&2
  exit 1
fi
echo "› deployed: $LATEST"

for A in rafiimanggala.vercel.app rafii-ai.vercel.app; do
  vercel alias set "$LATEST" "$A" >/dev/null 2>&1 && echo "› aliased: https://$A"
done

echo "✓ live at https://rafiimanggala.vercel.app"
