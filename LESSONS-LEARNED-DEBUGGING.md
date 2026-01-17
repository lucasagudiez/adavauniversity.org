# Deployment & UX Debugging - Lessons Learned

**Date:** 2026-01-16  
**Purpose:** Document insights from real debugging sessions to help future agents

---

## 🚨 Critical: Node.js Version Compatibility

### The Problem
**Symptom:** Tests pass locally but fail on production server with "SyntaxError: Unexpected token"

**Root Cause:** Production server runs **Node.js 8.10.0** (from 2018) which doesn't support modern JavaScript syntax.

### What Breaks on Node 8
```javascript
// ❌ BREAKS on Node 8
options?.encoding          // Optional chaining
value ?? 'default'         // Nullish coalescing  
class { #privateField }    // Private fields
```

### How to Fix
```javascript
// ✅ Node 8 compatible
options && options.encoding
value !== null && value !== undefined ? value : 'default'
// Avoid private fields entirely
```

### How to Detect
1. **Check server Node version:**
   ```bash
   ssh user@server "node --version"
   ```

2. **Look for these error patterns in logs:**
   ```
   SyntaxError: Unexpected token .
   SyntaxError: Unexpected token ?
   ```

3. **Common file locations to check:**
   - `/home/lucas/logs/adavauniversity-deploy.log`
   - Check error at line numbers matching modern syntax

### Prevention
- Always test with the server's Node version before deploying
- Document server Node version in `.cursorrules`
- Consider upgrading server to Node 18 LTS
- Use Babel if you must support old Node versions

---

## 🎯 Z-Index Layering for Canvas Backgrounds

### The Problem
**Symptom:** Network particles/canvas appear ABOVE text content, obscuring the hero headline.

**Root Cause:** Canvas z-index was set to `1`, same as or higher than content containers.

### The Fix
```css
/* ❌ WRONG - Particles above content */
#network-bg {
    position: fixed;
    z-index: 1;  /* Same as content! */
}
.hero-container {
    z-index: 1;  /* Conflict! */
}

/* ✅ CORRECT - Particles behind content */
#network-bg {
    position: fixed;
    z-index: 0;  /* Behind everything */
    pointer-events: none;  /* Let clicks pass through */
}
.hero-container {
    position: relative;
    z-index: 10;  /* Clearly above background */
}
```

### Z-Index Best Practices
```
Layer Structure (bottom to top):
-1 or 0: Background effects (particles, gradients)
1-10: Content layers (sections, cards)
100+: Overlays (modals, tooltips)
1000+: Navigation (fixed nav, menus)
9999+: Critical UI (notifications, alerts)
```

### Visual Verification Required
**ALWAYS take a screenshot after fixing z-index issues to verify:**
```bash
# Navigate to page
browser_navigate(url)

# Take screenshot
browser_take_screenshot(filename)

# Verify text is fully visible, particles are behind
```

---

## 🔒 Auto-Deploy System Behavior

### How It Works
1. **Server polls** origin/deploy every 10 seconds
2. **Fetches latest** commit from GitHub
3. **Runs tests** automatically (node scripts/test-runner.js)
4. **If tests pass:** Keeps new version
5. **If tests fail:** Auto-reverts to last working commit

### Key Insight
**The server NEVER serves broken code** - it will revert automatically. This means:
- If site looks old, tests are probably failing
- Check deploy logs to see failure reason
- Don't assume push = deployed

### How to Debug Failed Deployments
```bash
# 1. SSH into server
ssh lucas@adavauniversity.org

# 2. Check current commit
cd /home/lucas/www/adavauniversity.org
git log --oneline -1

# 3. Compare to remote
git log origin/deploy --oneline -1

# 4. Check deploy logs for failures
tail -50 /home/lucas/logs/adavauniversity-deploy.log

# 5. Look for test errors
cat /tmp/test-output.txt
```

### Log Patterns to Look For
```
[timestamp] New changes detected    ← Tried to pull
[timestamp] Tests FAILED!          ← Something broke
[timestamp] Reverted to [commit]   ← Rolled back
[timestamp] Tests passed           ← Successfully deployed
```

---

## ⚠️ UX Anti-Patterns That Break Trust

### Problem 1: Auto-Populating Form Fields

**What happened:**
```javascript
// ❌ DESTROYS TRUST
setTimeout(() => {
    scholarshipCode.value = 'WELCOME2026';
    applyScholarship();
}, 5000);
```

**Why this is bad:**
- Looks like a scam/fake urgency
- User didn't take action
- Reduces conversion rates
- Creates confusion

**Fix:**
```javascript
// ✅ Let users enter codes manually
// Remove auto-fill entirely
```

### Problem 2: Buttons That Don't Do What They Say

**What happened:**
- "Apply Now" button submitted a form
- Didn't show the user what they were applying for
- Skipped date selection step

**Fix:**
```javascript
// ✅ Button should navigate, not submit
form.addEventListener('submit', (e) => {
    e.preventDefault();  // Don't submit yet!
    
    // Scroll to where user makes decisions
    cohortsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Help user start filling the form
    setTimeout(() => {
        firstInput.focus();
    }, 500);  // Wait for scroll to finish
});
```

**User Flow Principle:**
```
Bad:  Click → Submit → Confused
Good: Click → Scroll → See options → Decide → Fill → Submit
```

---

## 🔍 Debugging Checklist for Deployment Issues

### When site is "stuck" on old version:

- [ ] **Check if branches are synced**
  ```bash
  git log main --oneline -5
  git log origin/deploy --oneline -5
  # Should match!
  ```

- [ ] **SSH to server and check current commit**
  ```bash
  ssh user@server "cd /path/to/site && git log --oneline -1"
  ```

- [ ] **Check deploy logs for failures**
  ```bash
  ssh user@server "tail -50 /path/to/logs/deploy.log"
  ```

- [ ] **Look for syntax errors in test output**
  ```bash
  ssh user@server "cat /tmp/test-output.txt"
  ```

- [ ] **Verify Node.js version matches your dev environment**
  ```bash
  ssh user@server "node --version"
  ```

- [ ] **Test the exact failing commit locally**
  ```bash
  git checkout [failing-commit]
  node scripts/test-runner.js
  ```

---

## 🎨 CSS Background Effects Best Practices

### Canvas/Particle Backgrounds

```html
<!-- HTML Structure -->
<canvas id="network-bg"></canvas>  <!-- Background -->
<main>Content here</main>          <!-- Content -->
```

```css
/* Required CSS */
#network-bg {
    position: fixed;           /* Stay in place */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;                /* BEHIND content */
    pointer-events: none;      /* Don't block clicks */
}

/* Ensure content is above */
main, .hero-container, section {
    position: relative;
    z-index: 10;               /* ABOVE background */
}
```

### Common Mistakes
```css
/* ❌ DON'T DO THIS */
#network-bg {
    z-index: 1;               /* Will cover z-index: 1 content */
    pointer-events: auto;     /* Will block clicks! */
}

.hero {
    /* No z-index = relies on DOM order = unreliable */
}
```

---

## 📝 Form Interaction Patterns

### Problem: Users Don't Know What to Do Next

**Symptoms:**
- High bounce rate on CTAs
- Users click but don't complete forms
- Confusion about next steps

**Solution: Guide Users Through Steps**

```javascript
// Bad: Just scroll
element.scrollIntoView();

// Good: Scroll + Focus + Visual Feedback
element.scrollIntoView({ behavior: 'smooth' });
setTimeout(() => {
    firstInput.focus();     // Cursor in field
    firstInput.select();    // Highlight existing text if any
}, 500);  // Wait for scroll animation
```

### Apply Now Button Best Practice

```javascript
// ✅ Complete User Journey
document.querySelectorAll('.cta-form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();  // Don't submit yet!
        
        // 1. Scroll to decision point
        const targetSection = document.getElementById('cohorts');
        targetSection.scrollIntoView({ behavior: 'smooth' });
        
        // 2. Focus on first input
        setTimeout(() => {
            const firstInput = targetSection.querySelector('input');
            firstInput?.focus();
        }, 500);
        
        // 3. User now sees options and can fill form
        // 4. Actual submission happens later
    });
});
```

---

## 🧪 Testing Workflow for UX Changes

### ALWAYS Verify with Browser

```bash
# 1. Start local server
cd /path/to/project
python3 -m http.server 8890 &

# 2. Navigate to page
browser_navigate(http://localhost:8890)

# 3. Test the interaction
browser_click(element)
sleep 1  # Wait for animation

# 4. Take screenshot for verification
browser_take_screenshot('verification.png')

# 5. Check behavior programmatically
browser_evaluate(() => {
    return {
        scrolledToTarget: /* check scroll position */,
        focusedElement: document.activeElement,
        isEmpty: field.value === ''
    };
});
```

### Never Skip Visual Verification

**For ANY of these changes, take a screenshot:**
- Z-index fixes
- Form behavior
- Scroll interactions
- Auto-fill removal
- Button click results

---

## 🔑 Key Takeaways

1. **Server Node version matters** - Modern syntax breaks old Node
2. **Z-index requires explicit values** - Don't rely on DOM order
3. **Auto-deploy tests protect you** - Failed tests = auto-rollback
4. **Auto-fill breaks trust** - Let users enter their own data
5. **Buttons should guide, not rush** - Show options before submission
6. **Always verify visually** - Screenshots prove it works
7. **SSH debugging is essential** - Logs tell the real story

---

## 📚 Common File Locations

### Adava University Project
```
Server:
- Deploy dir: /home/lucas/www/adavauniversity.org
- Deploy logs: /home/lucas/logs/adavauniversity-deploy.log
- Test output: /tmp/test-output.txt

Local:
- Main worktree: /Users/lucas/cursor projects/adavauniversity.org
- Deploy worktree: /Users/lucas/cursor projects/adavauniversity.org-deploy

Server:
- User: lucas
- Host: adavauniversity.org (via SSH)
- Node version: 8.10.0 (OLD - be careful!)
```

---

## 🎓 When You Encounter Similar Issues

### Deployment Not Working
1. Check Node version compatibility
2. Review deploy logs
3. Test locally with server's Node version
4. Look for modern syntax (optional chaining, etc.)

### Visual Bug (Z-Index)
1. Take screenshot to confirm
2. Check canvas/background z-index (should be 0 or negative)
3. Check content z-index (should be 10+)
4. Test with browser dev tools

### UX Issue (Forms/Buttons)
1. Remove auto-fill/auto-submit logic
2. Add proper scroll + focus behavior
3. Test the full user journey
4. Take screenshots at each step

---

**Remember: When in doubt, SSH to the server and check the logs. They never lie.**
