#!/bin/bash
# Server-side deploy script for adavauniversity.org
# Pulls latest from deploy branch, tests, and reverts if tests fail
# Run this via cron or systemd timer every 10 seconds

set -e

# Load NVM to use Node 16+ (supports modern JavaScript)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

DEPLOY_DIR="/home/lucas/www/adavauniversity.org"
LOG_FILE="/home/lucas/logs/adavauniversity-deploy.log"
LOCK_FILE="/tmp/adavauniversity-deploy.lock"

# Prevent concurrent runs
if [ -f "$LOCK_FILE" ]; then
    exit 0
fi
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

cd "$DEPLOY_DIR"

# Get current commit before pulling
CURRENT_COMMIT=$(git rev-parse HEAD)

# Check for updates
git fetch origin deploy --quiet
REMOTE_COMMIT=$(git rev-parse origin/deploy)

if [ "$CURRENT_COMMIT" = "$REMOTE_COMMIT" ]; then
    # No updates
    exit 0
fi

echo "$(date): New deploy detected: $CURRENT_COMMIT -> $REMOTE_COMMIT" >> "$LOG_FILE"

# Store working commit for potential rollback
LAST_WORKING_COMMIT="$CURRENT_COMMIT"

# Pull the new version
git reset --hard origin/deploy

# Run tests
echo "$(date): Running tests with Node $(node --version)..." >> "$LOG_FILE"

# Run unit tests
if node scripts/test-runner.js > /tmp/test-output.txt 2>&1; then
    echo "$(date): ✅ Unit tests passed" >> "$LOG_FILE"
else
    echo "$(date): ❌ Unit tests FAILED - reverting to $LAST_WORKING_COMMIT" >> "$LOG_FILE"
    cat /tmp/test-output.txt >> "$LOG_FILE"
    
    # Revert to last working version
    git reset --hard "$LAST_WORKING_COMMIT"
    
    echo "$(date): Reverted to working version" >> "$LOG_FILE"
    exit 1
fi

# Verify critical files exist
if [ ! -f "index.html" ] || [ ! -f "styles.css" ]; then
    echo "$(date): ❌ Critical files missing - reverting" >> "$LOG_FILE"
    git reset --hard "$LAST_WORKING_COMMIT"
    exit 1
fi

# All checks passed - save this as last known working commit
echo "$REMOTE_COMMIT" > .last-working-commit

echo "$(date): ✅ Deploy successful! Now at $REMOTE_COMMIT" >> "$LOG_FILE"
