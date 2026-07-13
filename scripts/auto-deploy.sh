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

# Reliability note — added 2026-07-13
# ──────────────────────────────────────────────────────────────
# Root-caused a run of days (~7/7–7/11) where the research pipeline kept
# writing new articles into this folder's data/articles.json but the push
# step never landed them on origin/main — they just piled up locally and
# silently waited for someone to notice the live site was stale. The old
# version of this script trusted `git push`'s exit code and moved on; if the
# push failed for a transient reason (network blip, origin having moved),
# `set -e` would kill the script, but nothing re-checked afterward that
# origin/main *actually* pointed at the new commit, and nothing retried
# within the same run. Fix: retry the clone→commit→push cycle a few times,
# and after a reported-successful push, verify via `git ls-remote` that
# origin/main really does point at the commit we just made — don't just
# trust the exit code. Any remaining failure now exits non-zero loudly
# instead of quietly leaving articles queued for "next time."

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PARENT_DIR="$(cd "$REPO_DIR/.." && pwd)"
PAT_FILE="$PARENT_DIR/.github-token"
HOOK_FILE="$PARENT_DIR/.vercel-deploy-hook"
SCRATCH_DIR="/tmp/svdg-deploy-scratch"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')] svdg-auto-deploy:"
MAX_ATTEMPTS=3

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

PUSHED_SHA=""
ATTEMPT=1
while (( ATTEMPT <= MAX_ATTEMPTS )); do
  echo "$LOG_PREFIX Attempt $ATTEMPT/$MAX_ATTEMPTS: cloning..."

  # Fresh, disposable clone each attempt — lives entirely outside the
  # connected folder, so nothing here ever needs delete-permission from the
  # user, no matter how a prior run ended. Re-cloning on retry also means we
  # pick up any commits that landed on origin/main between attempts.
  rm -rf "$SCRATCH_DIR"
  if ! git clone --quiet --depth 1 "$AUTH_URL" "$SCRATCH_DIR" 2>/tmp/svdg-clone-err.log; then
    echo "$LOG_PREFIX Attempt $ATTEMPT: clone failed — $(tail -1 /tmp/svdg-clone-err.log)" >&2
    ATTEMPT=$((ATTEMPT + 1))
    sleep 5
    continue
  fi

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
  # sandbox), so set it explicitly — matching the identity this repo's
  # existing commit history already uses.
  git config user.name "Simone SVDG"
  git config user.email "simone@siliconvalleydefense.org"

  git commit -m "chore: daily research $(date +%Y-%m-%d)" --quiet
  echo "$LOG_PREFIX Attempt $ATTEMPT: committed data/articles.json (disposable clone)."

  if git push --quiet "$AUTH_URL" HEAD:main 2>/tmp/svdg-push-err.log; then
    PUSHED_SHA="$(git rev-parse HEAD)"
    echo "$LOG_PREFIX Attempt $ATTEMPT: pushed $PUSHED_SHA to GitHub (PAT auth)."
    break
  else
    echo "$LOG_PREFIX Attempt $ATTEMPT: push failed — $(tail -1 /tmp/svdg-push-err.log). Likely origin moved; retrying with a fresh clone..." >&2
    cd "$REPO_DIR"
    ATTEMPT=$((ATTEMPT + 1))
    sleep 5
  fi
done

if [[ -z "$PUSHED_SHA" ]]; then
  echo "$LOG_PREFIX ERROR: failed to push after $MAX_ATTEMPTS attempts. Articles remain in this folder's data/articles.json and will be swept up automatically by the next successful run — but this run counts as a failure and should be reported as such." >&2
  exit 1
fi

# Don't just trust the exit code — confirm origin/main actually points at the
# commit we just pushed. This is the check that was missing before; without
# it, a push that appears to succeed locally but doesn't land (e.g. silently
# rejected, or racing another writer) would go unnoticed.
REMOTE_SHA="$(git ls-remote "$AUTH_URL" refs/heads/main | cut -f1)"
if [[ "$REMOTE_SHA" != "$PUSHED_SHA" ]]; then
  echo "$LOG_PREFIX ERROR: verification failed — origin/main is $REMOTE_SHA, expected $PUSHED_SHA. Push did not land as expected." >&2
  exit 1
fi
echo "$LOG_PREFIX Verified origin/main now points at $PUSHED_SHA."

if [[ -f "$HOOK_FILE" ]]; then
  HOOK_URL="$(tr -d '[:space:]' < "$HOOK_FILE")"
  HOOK_HTTP_STATUS="$(curl -s -o /tmp/svdg-hook-response.json -w '%{http_code}' -X POST "$HOOK_URL")"
  if [[ "$HOOK_HTTP_STATUS" =~ ^2 ]]; then
    echo "$LOG_PREFIX Vercel redeploy triggered (HTTP $HOOK_HTTP_STATUS): $(cat /tmp/svdg-hook-response.json)"
  else
    echo "$LOG_PREFIX ERROR: Vercel deploy hook returned HTTP $HOOK_HTTP_STATUS: $(cat /tmp/svdg-hook-response.json)" >&2
    exit 1
  fi
else
  echo "$LOG_PREFIX Warning: no deploy hook found at $HOOK_FILE — skipping Vercel trigger."
  echo "$LOG_PREFIX Push succeeded; redeploy manually, or save a hook URL to $HOOK_FILE to automate."
fi

echo "$LOG_PREFIX Done."
