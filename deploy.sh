#!/usr/bin/env bash
# Deploy to Vercel production and keep the clean aliases pointed at it.
set -euo pipefail

echo "› deploying to production..."
DEPLOY_URL="$(vercel --prod --yes 2>/dev/null | tail -1)"
echo "› deployed: $DEPLOY_URL"

for ALIAS in rafiimanggala.vercel.app rafii-ai.vercel.app; do
  vercel alias set "$DEPLOY_URL" "$ALIAS" >/dev/null 2>&1 && echo "› aliased: https://$ALIAS"
done

echo "✓ live at https://rafiimanggala.vercel.app"
