# Testing Strategy

## Overview

| Test Type | Count | Time | When to Run |
|-----------|-------|------|-------------|
| **Unit Tests** | 67+ | **0.2s** ⚡ | Every commit (automatic) |
| **Smoke Tests** | 6 | **5-7s** 🚀 | Quick validation |
| **Full UX Tests** | 20+ | **15-20s** 🧪 | Before releases |

---

## Test Commands

```bash
# Fast unit tests (runs automatically on commit)
npm test                    # ~0.2 seconds

# Smoke tests (critical path only)
npm run test:ux:smoke       # ~7 seconds

# Full UX/E2E tests
npm run test:ux             # ~15-20 seconds (Chromium only)
npm run test:ux:all         # ~30 seconds (all browsers)

# Everything
npm run test:full           # Unit + Full UX

# Interactive/Debug
npm run test:ux:ui          # Playwright UI mode
npm run test:ux:headed      # Watch tests in browser
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
