# Testing Strategy

## Overview

| Test Type | Count | Time | When to Run |
|-----------|-------|------|-------------|
| **Unit Tests** | 70+ | **~1s** ⚡ | Every commit (automatic) |
| **Smoke Tests** | 6 | **~5s** 🚀 | Quick validation after UI changes |
| **Full UX Tests** | 40+ | **~20s** 🧪 | Before releases, after major changes |
| **Mobile Tests** | 10+ | **~10s** 📱 | After responsive changes |

---

## Quick Reference Commands

```bash
# TIER 1: Fast unit tests (runs automatically on commit)
npm test                    # ~1 second

# TIER 2: Smoke tests (critical path only)
npm run test:ux:smoke       # ~5 seconds

# TIER 3: Full browser tests
npm run test:ux             # ~20 seconds (Chromium only)
npm run test:ux:mobile      # ~10 seconds (Mobile Chrome only)
npm run test:responsive     # Desktop + Mobile

# Everything
npm run test:full           # Unit + Full UX (~25 seconds)

# CI/CD
npm run test:ci             # Unit + Smoke (fast verification)
npm run check               # Quick sanity check

# Interactive/Debug
npm run test:ux:ui          # Playwright UI mode
npm run test:ux:headed      # Watch tests in browser
```

---

## Decision Tree: Which Tests to Run

```
Made a change?
├── Changed styles.css?
│   └── Run: npm run test && npm run test:ux:smoke
├── Changed index.html structure?
│   └── Run: npm run test && npm run test:ux:smoke
├── Changed content only?
│   └── Run: npm test (unit tests enough)
├── Added new section/feature?
│   └── Run: npm run test:full (all tests)
├── Fixed a bug?
│   └── Run: npm run test:full (ensure no regressions)
└── About to commit?
    └── Run: npm run check (quick sanity check)
```

---

## When to Run What

### ✅ Every Commit (Automatic)
- **Unit tests** (`scripts/test-runner.js`) - 67+ tests in 0.2s
- Enforced by Git pre-commit hook
- Tests file structure, HTML content, CSS patterns, UI effects

### 🔸 Before Merging / Major Changes
- **Smoke tests** (`npm run test:ux:smoke`)
- Tests tagged with `@smoke`: page load, hero, CTA, forms, structure
- ~7 seconds

### 🔶 Before Release / Weekly
- **Full UX tests** (`npm run test:ux`)
- All E2E tests with Playwright
- ~15-20 seconds

---

## Test Architecture

### Unit Tests (`scripts/test-runner.js`)
- **Type**: Static code analysis
- **Speed**: ⚡ Instant (~0.2s for 67+ tests)
- **What they test**:
  - File existence (index.html, styles.css, favicon.svg)
  - HTML structure (DOCTYPE, viewport, lang)
  - Content presence (instructors, testimonials, pricing)
  - CSS patterns (glassmorphism, gradients, responsive)
  - UI effects (AOS, GSAP, Vanilla Tilt)

### UX/E2E Tests (`tests/ux.spec.js`)
- **Type**: Real browser automation (Playwright)
- **Speed**: 🐢 Slower (~15-20s)
- **What they test**:
  - Page load and initialization
  - User interactions (click, type, hover)
  - AOS/GSAP animation initialization
  - Form functionality
  - Responsive design
  - Accessibility

---

## Smoke Tests (@smoke tagged)

Critical tests that run quickly:
1. `page loads successfully with title` - Basic page load
2. `main hero section is visible` - Hero visible
3. `CTA button is visible and clickable` - Primary action
4. `navigation works` - Nav links present
5. `form inputs are functional` - Can type in forms
6. `page has proper semantic structure` - header/main/footer

---

## Git Hooks

### Pre-commit Hook
- Runs unit tests automatically
- Blocks commit if tests fail
- Shows test count

### Prepare-commit-msg Hook
- Appends test results to commit message
- Format: `Tests: ✅ 67 passed, 0 failed`

### Setup Hooks
```bash
cd scripts && ./setup-hooks.sh
```

---

## Adding New Tests

### Unit Test (fast)
Add to `scripts/test-runner.js`:
```javascript
test('new feature exists', () => {
    const html = fs.readFileSync(resolveRoot('index.html'), 'utf8');
    assert(html.includes('feature-class'), 'Missing feature');
});
```

### UX Test (slow)
Add to `tests/ux.spec.js`:
```javascript
test('feature works @smoke', async ({ page }) => {
    // @smoke tag for critical tests only
    await page.goto('/');
    await expect(page.locator('.feature')).toBeVisible();
});
```

---

## 🔗 Related Documents

- `.cursorrules` - Testing requirements in project rules
- `docs/UI-EFFECTS-RESEARCH.md` - UI effects that tests verify
