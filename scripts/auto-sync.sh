#!/bin/bash
# Easy OEE auto-sync — keeps the SSD working copy in sync with origin/main.
# Safe to run on a timer: bails out cleanly if SSD is unmounted, repo is busy,
# in the middle of a rebase/merge, or there's a real conflict.

set -u
REPO="/Volumes/CQ-PRO-4TB/Easy OEE/easy-oee"
LOG="$REPO/.git/auto-sync.log"
LOCK="$REPO/.git/auto-sync.lock"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG"; }

# 1. SSD must be mounted and repo must exist
[ -d "$REPO/.git" ] || exit 0

# 2. Single instance only (PID-based lock — macOS has no flock)
if [ -f "$LOCK" ]; then
  OLD=$(cat "$LOCK" 2>/dev/null)
  if [ -n "$OLD" ] && kill -0 "$OLD" 2>/dev/null; then
    exit 0
  fi
fi
echo $$ > "$LOCK"
trap 'rm -f "$LOCK"' EXIT

cd "$REPO" || exit 0

# 3. Make sure git can find ssh keys / keychain creds in launchd context
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
export HOME="${HOME:-/Users/$(/usr/bin/whoami)}"

# 4. Skip if a rebase/merge is in progress — don't make a mess
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ] || [ -f ".git/MERGE_HEAD" ]; then
  log "skip: rebase/merge in progress"
  exit 0
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
[ "$BRANCH" = "main" ] || { log "skip: not on main ($BRANCH)"; exit 0; }

# 5. Auto-commit any local changes so they don't get lost (only tracked files)
if ! git diff --quiet || ! git diff --cached --quiet; then
  git add -A >/dev/null 2>&1
  HOST=$(/bin/hostname -s)
  git commit -m "auto-sync: working changes from $HOST" >/dev/null 2>&1 \
    && log "auto-committed local changes from $HOST"
fi

# 6. Pull with rebase + autostash (handles untracked-safe edge cases)
if ! git pull --rebase --autostash origin main >> "$LOG" 2>&1; then
  log "ERROR: pull failed — manual intervention needed"
  /usr/bin/osascript -e 'display notification "Easy OEE auto-sync: pull failed. Run scripts/auto-sync.sh manually." with title "Easy OEE Sync"' 2>/dev/null
  exit 1
fi

# 7. Push if we're ahead
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u} 2>/dev/null)
if [ "$LOCAL" != "$REMOTE" ]; then
  if git push origin main >> "$LOG" 2>&1; then
    log "pushed $LOCAL"
  else
    log "ERROR: push failed"
    /usr/bin/osascript -e 'display notification "Easy OEE auto-sync: push failed." with title "Easy OEE Sync"' 2>/dev/null
    exit 1
  fi
fi

# 8. Mirror docs to Dropbox (backup-of-a-backup, docs only — no code, no build)
DROPBOX_DOCS="$HOME/Library/CloudStorage/Dropbox/Easy OEE/easy-oee"
if [ -d "$HOME/Library/CloudStorage/Dropbox/Easy OEE" ]; then
  mkdir -p "$DROPBOX_DOCS/docs" 2>/dev/null
  rsync -a --delete "$REPO/docs/" "$DROPBOX_DOCS/docs/" >> "$LOG" 2>&1 \
    && rsync -a \
      "$REPO/README.md" \
      "$REPO/AGENTS.md" \
      "$REPO/CLAUDE.md" \
      "$REPO/PROJECT.md" \
      "$REPO/FOR-LOUIS.md" \
      "$REPO/FOR-LOUIS-ES.md" \
      "$REPO/FOR-LOUIS.html" \
      "$DROPBOX_DOCS/" >> "$LOG" 2>&1 \
    && log "mirrored docs → Dropbox" \
    || log "WARN: dropbox docs mirror failed (non-fatal)"
fi

exit 0
