#!/bin/bash
#
# Setup git hooks for the project
# Run this after cloning: ./scripts/setup-hooks.sh
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo "🔧 Setting up git hooks..."

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Create pre-commit hook
cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash
echo "🧪 Running tests before commit..."
echo ""

node test-runner.js
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ Tests failed! Commit blocked."
    echo "   Fix the failing tests and try again."
    exit 1
fi

if [ -f .test-count ]; then
    OLD_COUNT=$(cat .test-count)
    NEW_COUNT=$(node test-runner.js 2>/dev/null | grep "Passed:" | awk '{print $2}')
    
    if [ -n "$NEW_COUNT" ] && [ "$NEW_COUNT" -lt "$OLD_COUNT" ]; then
        echo ""
        echo "❌ Test count decreased from $OLD_COUNT to $NEW_COUNT!"
        exit 1
    fi
fi

NEW_COUNT=$(node test-runner.js 2>/dev/null | grep "Passed:" | awk '{print $2}')
if [ -n "$NEW_COUNT" ]; then
    echo "$NEW_COUNT" > .test-count
fi

echo ""
echo "✅ All tests passed!"
exit 0
EOF

# Create prepare-commit-msg hook
cat > "$HOOKS_DIR/prepare-commit-msg" << 'EOF'
#!/bin/bash
COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

if [ "$COMMIT_SOURCE" = "merge" ] || [ "$COMMIT_SOURCE" = "squash" ]; then
    exit 0
fi

TEST_OUTPUT=$(node test-runner.js 2>&1)
PASSED=$(echo "$TEST_OUTPUT" | grep "Passed:" | awk '{print $2}')
FAILED=$(echo "$TEST_OUTPUT" | grep "Failed:" | awk '{print $2}')

if [ -n "$PASSED" ]; then
    echo "" >> "$COMMIT_MSG_FILE"
    echo "---" >> "$COMMIT_MSG_FILE"
    if [ "$FAILED" = "0" ]; then
        echo "Tests: ✅ $PASSED passed, 0 failed" >> "$COMMIT_MSG_FILE"
    else
        echo "Tests: ⚠️ $PASSED passed, $FAILED failed" >> "$COMMIT_MSG_FILE"
    fi
fi

exit 0
EOF

# Make hooks executable
chmod +x "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/prepare-commit-msg"

# Initialize test count if not exists
if [ ! -f "$PROJECT_ROOT/.test-count" ]; then
    cd "$PROJECT_ROOT"
    NEW_COUNT=$(node test-runner.js 2>/dev/null | grep "Passed:" | awk '{print $2}')
    if [ -n "$NEW_COUNT" ]; then
        echo "$NEW_COUNT" > .test-count
    fi
fi

echo "✅ Git hooks installed successfully!"
echo ""
echo "Hooks installed:"
echo "  - pre-commit: Runs tests before each commit"
echo "  - prepare-commit-msg: Adds test results to commit messages"
echo ""
echo "To test, try: git commit --allow-empty -m 'Test hooks'"


