#!/bin/bash
# One-command setup for Easy OEE auto-sync on a new Mac.
# Installs the post-commit hook + loads the launchd agent.
# Safe to re-run.

set -e
REPO="/Volumes/CQ-PRO-4TB/Easy OEE/easy-oee"

if [ ! -d "$REPO/.git" ]; then
  echo "ERROR: SSD not mounted or repo missing at $REPO"
  exit 1
fi

cd "$REPO"

# 1. Install post-commit hook
cat > .git/hooks/post-commit <<'HOOK'
#!/bin/bash
( "/Volumes/CQ-PRO-4TB/Easy OEE/easy-oee/scripts/auto-sync.sh" & ) >/dev/null 2>&1
exit 0
HOOK
chmod +x .git/hooks/post-commit
chmod +x scripts/auto-sync.sh
echo "✓ post-commit hook installed"

# 2. Install + load launchd agent
AGENT_DIR="$HOME/Library/LaunchAgents"
AGENT="$AGENT_DIR/com.cqdesigns.easyoee.autosync.plist"
mkdir -p "$AGENT_DIR"
cp "$REPO/scripts/com.cqdesigns.easyoee.autosync.plist" "$AGENT"
launchctl unload "$AGENT" 2>/dev/null || true
launchctl load "$AGENT"
echo "✓ launchd agent loaded (syncs every 3 min)"

# 3. Enable macOS keychain credential helper for git push without prompts
git config --global credential.helper osxkeychain
echo "✓ git credential helper set to osxkeychain"

# 4. Smoke test
"$REPO/scripts/auto-sync.sh"
echo "✓ initial sync ran"
echo
echo "Auto-sync is live. Log: $REPO/.git/auto-sync.log"
