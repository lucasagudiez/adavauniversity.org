# Bug Report: Particles Appearing Above Text

**Date:** 2026-01-16  
**Status:** 🐛 Identified - Fix in Progress  
**Severity:** Medium (Visual/UX Issue)

---

## Description

Animated particles (network effect dots/lines) are rendering **above** the hero section text, obscuring the main headline and subheadline text.

---

## Visual Evidence

**Location:** Hero section (top of homepage)  
**Affected Text:**
- "Become a Programmer in Just 10 Days"
- "Without writing a single line of code"
- "Using the AI tools that are transforming the industry"
- University names (MIT, Stanford, Oxford, Cambridge, Harvard)
- Company names (Google, Apple, Meta, Amazon, Microsoft)

**Screenshot:** Provided by user at 2026-01-16 8:45 PM

---

## Technical Details

### Root Cause
Z-index layering issue where the particle canvas/container has a higher z-index than the hero text content.

### Expected Behavior
- Particles should render **behind** all text content
- Text should always be fully readable
- Particles serve as background decoration only

### Current Behavior
- Particles render **above** text
- Some text is obscured by moving particles
- Reduces readability of critical hero content

---

## CSS Investigation

**Likely culprit:**
- `.particles-js` or similar particle container has `z-index` value that's too high
- Hero text content may lack explicit `z-index` positioning
- Parent containers may not establish proper stacking context

---

## Impact

**User Experience:**
- ❌ Reduced readability of main headline
- ❌ Unprofessional appearance
- ❌ May affect conversion rates
- ❌ Particularly bad on certain screen sizes/positions

**Frequency:** Always present

---

## Fix Plan

1. Lower z-index of particle container (or set to negative)
2. Ensure hero text has positive z-index
3. Verify stacking context is correct
4. Test across viewports (mobile, tablet, desktop)

---

## Testing Checklist

- [ ] Particles appear behind all text
- [ ] Text is fully readable at all times
- [ ] Particles still animate properly
- [ ] Works on mobile viewports
- [ ] Works on tablet viewports
- [ ] Works on desktop viewports
- [ ] No other visual regressions

---

## Files to Modify

- `styles.css` - Adjust z-index values
- `index.html` - Verify DOM structure if needed
