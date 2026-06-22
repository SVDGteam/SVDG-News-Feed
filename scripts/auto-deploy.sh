#!/usr/bin/env bash
# scripts/auto-deploy.sh
#
# Commits any new articles written by the daily research pipeline and
# triggers a Vercel redeploy. Called automatically at the end of the
# Cowork scheduled task — no crontab needed.
#
# Design note — why this clones instead of committing in place
# ──────────────────────────────────────────────────────────────
# Each scheduled run happens in a brand-new sandbox. Earlier versions of this
# script ran `git commit`/`git push` directly inside this connected project
# folder, which occasionally left a stale .git/*.lock file behind if a run
# got interrupted mid-operation. Cleaning that up required deleting a file
# inside the connected folder, which needs a fresh permission grant in every
# new sandbox — defeating "set and forget."
#
# Fix: do all git work in a disposable clone under /tmp (outside the
# connected folder, so nothing there ever needs delete permission), then
# just overwrite this folder's data/articles.json — a write, not a delete.
# This folder's own .git is intentionally left untouched by automation; it
# may show as "behind" origin/main if you check it manually, but the data
# file itself is always current. Run `git pull` here if you ever want this
# checkout's git history to catch up.
#
# One-time setup
# ──────────────
# 1. Create a GitHub PAT (repo scope) at github.com/settings/tokens and save it
#    next to this project folder (already done if you're reading this after
#    initial setup):
#      echo "ghp_yourtoken" > ~/Claude/Projects/Defense\ Investment\ News/.github-token
#
# 2. Create a Vercel Deploy Hook for svdg-news-feed and save the URL inside
#    the connected folder (NOT your home directory — that doesn't persist
#    across scheduled runs):
#      Vercel dashboard → svdg-news-feed project → Settings → Git → Deploy Hooks
#      Name it "daily-research", branch "main", copy the URL.
#      echo "https://api.vercel.com/v1/integrations/deploy/..." > \
#        ~/Claude/Projects/Defense\ Investment\ News/.vercel-deploy-hook
#
# Logs are written by the caller (see the scheduled task) to a timestamped
# file under /tmp for debugging.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PARENT_DIR="$(cd "$REPO_DIR/.." && pwd)"
PAT_FILE="$PARENT_DIR/.github-token"
HOOK_FILE="$PARENT_DIR/.vercel-deploy-hook"
SCRATCH_DIR="/tmp/svdg-deploy-scratch"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')] svdg-auto-deploy:"

cleanup() {
  rm -rf "$SCRATCH_DIR"
}
trap cleanup EXIT

if [[ ! -f "$PAT_FILE" ]]; then
  echo "$LOG_PREFIX ERROR: no GitHub PAT found at $PAT_FILE — cannot push." >&2
  exit 1
fi
PAT="$(tr -d '[:space:]' < "$PAT_FILE")"

REMOTE_URL="$(git -C "$REPO_DIR" remote get-url origin)"
# Inject token: https://github.com/... → https://oauth2:<token>@github.com/...
AUTH_URL="${REMOTE_URL/https:\/\//https://oauth2:${PAT}@}"

# Fresh, disposable clone — lives entirely outside the connected folder, so
# nothing here ever needs delete-permission from the user, no matter how a
# prior run ended.
rm -rf "$SCRATCH_DIR"
git clone --quiet --depth 1 "$AUTH_URL" "$SCRATCH_DIR"

# Pull in this run's updated data file (the research pipeline already wrote
# it into the connected folder directly — no git involved on that side).
cp "$REPO_DIR/data/articles.json" "$SCRATCH_DIR/data/articles.json"

cd "$SCRATCH_DIR"
git add data/articles.json

if git diff --staged --quiet; then
  echo "$LOG_PREFIX No new articles — nothing to commit."
  exit 0
fi

# A fresh clone has no git identity configured (no ~/.gitconfig in this
# sandbox), so set it explicitly — matching the identity this repo's existing
# commit history already uses.
git config user.name "Simone SVDG"
git config user.email "simone@siliconvalleydefense.org"

git commit -m "chore: daily research $(date +%Y-%m-%d)" --quiet
echo "$LOG_PREFIX Committed data/articles.json (disposable clone)."

git push --quiet "$AUTH_URL" HEAD:main
echo "$LOG_PREFIX Pushed to GitHub (PAT auth)."

if [[ -f "$HOOK_FILE" ]]; then
  HOOK_URL="$(tr -d '[:space:]' < "$HOOK_FILE")"
  curl -s -X POST "$HOOK_URL" > /dev/null
  echo "$LOG_PREFIX Vercel redeploy triggered."
else
  echo "$LOG_PREFIX Warning: no deploy hook found at $HOOK_FILE — skipping Vercel trigger."
  echo "$LOG_PREFIX Push succeeded; redeploy manually, or save a hook URL to $HOOK_FILE to automate."
fi

echo "$LOG_PREFIX Done."
