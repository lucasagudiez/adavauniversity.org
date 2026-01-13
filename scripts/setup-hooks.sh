#!/bin/bash
# Setup git hooks for the AdaVa University project

HOOK_DIR="$(git rev-parse --show-toplevel)/.git/hooks"

# Create pre-commit hook
cat > "$HOOK_DIR/pre-commit" << 'EOF'
#!/bin/bash
# Pre-commit hook: Run tests before allowing commit

echo "========================================"
echo "Running pre-commit tests..."
echo "========================================"

cd "$(git rev-parse --show-toplevel)"

# Run tests
node scripts/test-runner.js
TEST_EXIT=$?

if [ $TEST_EXIT -ne 0 ]; then
    echo ""
    echo "❌ COMMIT BLOCKED: Tests failed!"
    echo "Fix the failing tests before committing."
    exit 1
fi

# Get current test count from test output
CURRENT_COUNT=$(node scripts/test-runner.js 2>/dev/null | grep "Passed:" | sed 's/Passed: //')

echo ""
echo "✅ All $CURRENT_COUNT tests passed!"
echo "========================================"
exit 0
EOF

chmod +x "$HOOK_DIR/pre-commit"
echo "✅ Pre-commit hook installed"

# Create prepare-commit-msg hook
cat > "$HOOK_DIR/prepare-commit-msg" << 'EOF'
#!/bin/bash
# Append test results to commit message

cd "$(git rev-parse --show-toplevel)"

# Get test count
TEST_OUTPUT=$(node scripts/test-runner.js 2>/dev/null)
PASSED=$(echo "$TEST_OUTPUT" | grep "Passed:" | sed 's/Passed: //')
FAILED=$(echo "$TEST_OUTPUT" | grep "Failed:" | sed 's/Failed: //')

# Append to commit message
if [ -n "$PASSED" ]; then
    echo "" >> "$1"
    echo "---" >> "$1"
    echo "Tests: ✅ $PASSED passed, $FAILED failed" >> "$1"
fi
EOF

chmod +x "$HOOK_DIR/prepare-commit-msg"
echo "✅ Prepare-commit-msg hook installed"

echo ""
echo "Git hooks installed successfully!"
echo "- Pre-commit: Runs tests, blocks commit if tests fail"
echo "- Prepare-commit-msg: Adds test results to commit message"
