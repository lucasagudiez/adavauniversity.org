#!/bin/bash
# Deploy to production using git worktree (no branch switching)
# Runs ALL tests (unit + UX) before allowing deploy

set -e

MAIN_DIR="/Users/lucas/cursor projects/adavauniversity.org"
DEPLOY_WORKTREE="/Users/lucas/cursor projects/adavauniversity.org-deploy"

echo "🚀 Preparing deployment..."
echo ""

# Step 1: Run unit tests
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 1: Running unit tests..."
echo "═══════════════════════════════════════════════════════════════"
cd "$MAIN_DIR"
node scripts/test-runner.js
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ DEPLOY BLOCKED: Unit tests failed!"
    exit 1
fi
echo "✅ Unit tests passed"
echo ""

# Step 2: Run UX tests (if playwright is available)
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 2: Running UX tests..."
echo "═══════════════════════════════════════════════════════════════"
if command -v npx &> /dev/null && [ -f "playwright.config.js" ]; then
    # Run playwright and capture output
    npx playwright test --reporter=line 2>&1 | tee /tmp/playwright-output.txt
    
    # Check final summary line for failures
    SUMMARY=$(tail -5 /tmp/playwright-output.txt | grep -E "^\s*[0-9]+ (passed|failed)" || echo "")
    if echo "$SUMMARY" | grep -q "failed"; then
        echo ""
        echo "❌ DEPLOY BLOCKED: UX tests failed!"
        echo "   $SUMMARY"
        exit 1
    else
        echo "✅ UX tests passed"
        echo "   $SUMMARY"
    fi
else
    echo "⚠️  Playwright not found, skipping UX tests"
fi
echo ""

# Step 3: Push main branch
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 3: Pushing to main..."
echo "═══════════════════════════════════════════════════════════════"
cd "$MAIN_DIR"
git push origin main
echo "✅ Main pushed"
echo ""

# Step 4: Update deploy worktree and push
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 4: Updating deploy branch..."
echo "═══════════════════════════════════════════════════════════════"
cd "$DEPLOY_WORKTREE"
git fetch origin
git merge origin/main -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin deploy
echo "✅ Deploy branch pushed"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ DEPLOYED SUCCESSFULLY"
echo "═══════════════════════════════════════════════════════════════"
echo "   Server will test and update (or rollback) automatically."
echo "   https://adavauniversity.org/"
echo ""
