#!/usr/bin/env bash
# scripts/auto-deploy.sh
#
# Commits any new articles written by the daily research pipeline and
# triggers a Vercel redeploy. Run this on your Mac ~15 min after the
# Claude scheduled task fires (default cron: 14:20 = 2:20 PM).
#
# One-time setup
# ──────────────
# 1. Create a Vercel Deploy Hook for svdg-news-feed:
#      Vercel dashboard → svdg-news-feed project → Settings → Git → Deploy Hooks
#      Name it "daily-research", branch "main", copy the URL.
#
# 2. Save the hook URL:
#      mkdir -p ~/.svdg
#      echo "https://api.vercel.com/v1/integrations/deploy/..." > ~/.svdg/dispatch-deploy-hook
#
# 3. Make this script executable (one-time):
#      chmod +x ~/Claude/Projects/Defense\ Investment\ News/svdg-news-feed/scripts/auto-deploy.sh
#
# 4. Add to crontab — run `crontab -e` and paste this line:
#      20 14 * * * /Users/simonemontandon/Claude/Projects/Defense\ Investment\ News/svdg-news-feed/scripts/auto-deploy.sh >> /tmp/svdg-deploy.log 2>&1
#
# Logs are written to /tmp/svdg-deploy.log for debugging.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOK_FILE="$HOME/.svdg/dispatch-deploy-hook"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')] svdg-auto-deploy:"

cd "$REPO_DIR"

# Stage articles.json only — don't accidentally sweep up other local changes
git add data/articles.json

if git diff --staged --quiet; then
  echo "$LOG_PREFIX No new articles — nothing to commit."
  exit 0
fi

git commit -m "chore: daily research $(date +%Y-%m-%d)"
echo "$LOG_PREFIX Committed data/articles.json."

git push
echo "$LOG_PREFIX Pushed to GitHub."

if [[ -f "$HOOK_FILE" ]]; then
  HOOK_URL="$(tr -d '[:space:]' < "$HOOK_FILE")"
  curl -s -X POST "$HOOK_URL" > /dev/null
  echo "$LOG_PREFIX Vercel redeploy triggered."
else
  echo "$LOG_PREFIX Warning: no deploy hook found at $HOOK_FILE — skipping Vercel trigger."
  echo "$LOG_PREFIX Push succeeded; redeploy manually or add the hook file to automate."
fi

echo "$LOG_PREFIX Done."
