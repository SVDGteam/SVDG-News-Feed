#!/usr/bin/env bash
# scripts/auto-deploy.sh
#
# Commits any new articles written by the daily research pipeline and
# triggers a Vercel redeploy. Called automatically at the end of the
# Cowork scheduled task — no crontab needed.
#
# One-time setup
# ──────────────
# 1. Create a GitHub PAT (repo scope) at github.com/settings/tokens and save it:
#      echo "ghp_yourtoken" > ~/Claude/Projects/Defense\ Investment\ News/.github-token
#
# 2. (Optional) Create a Vercel Deploy Hook for svdg-news-feed:
#      Vercel dashboard → svdg-news-feed project → Settings → Git → Deploy Hooks
#      Name it "daily-research", branch "main", copy the URL.
#      mkdir -p ~/.svdg
#      echo "https://api.vercel.com/v1/integrations/deploy/..." > ~/.svdg/dispatch-deploy-hook
#      (Vercel also auto-deploys on every GitHub push, so this is optional.)
#
# Logs are written to /tmp/svdg-deploy.log for debugging.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOK_FILE="$HOME/.svdg/dispatch-deploy-hook"
PAT_FILE="$REPO_DIR/../.github-token"
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

# Push using PAT if available, otherwise fall back to default git credentials
if [[ -f "$PAT_FILE" ]]; then
  PAT="$(tr -d '[:space:]' < "$PAT_FILE")"
  REMOTE_URL="$(git remote get-url origin)"
  # Inject token: https://github.com/... → https://oauth2:<token>@github.com/...
  AUTH_URL="${REMOTE_URL/https:\/\//https://oauth2:${PAT}@}"
  git push "$AUTH_URL" HEAD:main
  echo "$LOG_PREFIX Pushed to GitHub (PAT auth)."
else
  git push
  echo "$LOG_PREFIX Pushed to GitHub (default auth)."
fi

if [[ -f "$HOOK_FILE" ]]; then
  HOOK_URL="$(tr -d '[:space:]' < "$HOOK_FILE")"
  curl -s -X POST "$HOOK_URL" > /dev/null
  echo "$LOG_PREFIX Vercel redeploy triggered."
else
  echo "$LOG_PREFIX Warning: no deploy hook found at $HOOK_FILE — skipping Vercel trigger."
  echo "$LOG_PREFIX Push succeeded; redeploy manually or add the hook file to automate."
fi

echo "$LOG_PREFIX Done."
