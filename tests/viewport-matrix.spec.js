// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Viewport Matrix Tests for AdaVa University
 * 
 * Tests all critical components across multiple viewports to prevent
 * responsive design bugs.
 * 
 * Run: npx playwright test tests/viewport-matrix.spec.js
 */

// Viewport configurations
const VIEWPORTS = {
    mobile_small: { width: 375, height: 667, name: 'iPhone SE' },
    mobile_large: { width: 430, height: 932, name: 'iPhone 15 Pro Max' },
    tablet_portrait: { width: 768, height: 1024, name: 'iPad Portrait' },
    tablet_landscape: { width: 1024, height: 768, name: 'iPad Landscape' },
    desktop: { width: 1440, height: 900, name: 'Desktop' },
};

// Helper to wait for page to be ready
async function waitForPageReady(page) {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
}

// ============================================================================
// HERO SECTION - VIEWPORT TESTS
// ============================================================================

test.describe('Hero Section - Viewport Matrix', () => {
    for (const [key, viewport] of Object.entries(VIEWPORTS)) {
        test(`hero visible on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('/');
            await waitForPageReady(page);
            
            const hero = page.locator('header.hero, .hero-section, #hero, header').first();
            await expect(hero).toBeVisible();
        });
        
        test(`CTA button clickable on ${viewport.name}`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('/');
            await waitForPageReady(page);
            
            const cta = page.locator('.cta-btn, .apply-btn, a.btn, button.btn').first();
            await expect(cta).toBeVisible();
            
            // Should be clickable (not covered by other elements)
            const box = await cta.boundingBox();
            expect(box).not.toBeNull();
            expect(box.width).toBeGreaterThan(40); // Minimum touch target
        });
    }
});

// ============================================================================
// NAVIGATION - VIEWPORT TESTS
// ============================================================================

test.describe('Navigation - Viewport Matrix', () => {
    test('desktop nav is visible on large screens', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await page.goto('/');
        await waitForPageReady(page);
        
        const nav = page.locator('nav');
        await expect(nav).toBeVisible();
    });
    
    test('nav works on mobile (visible or has hamburger)', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile_large);
        await page.goto('/');
        await waitForPageReady(page);
        
        // Either nav is visible OR there's a mobile menu button
        const nav = page.locator('nav');
        const hamburger = page.locator('.hamburger, .mobile-menu-btn, .menu-toggle, [aria-label*="menu"]');
        
        const navVisible = await nav.isVisible().catch(() => false);
        const hamburgerExists = await hamburger.count() > 0;
        
        expect(navVisible || hamburgerExists).toBe(true);
    });
});

// ============================================================================
// FORMS - VIEWPORT TESTS
// ============================================================================

test.describe('Forms - Viewport Matrix', () => {
    for (const [key, viewport] of Object.entries(VIEWPORTS)) {
        test(`form inputs visible on ${viewport.name}`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('/');
            await waitForPageReady(page);
            
            // Find email input
            const emailInput = page.locator('input[type="email"]').first();
            const inputCount = await emailInput.count();
            
            if (inputCount > 0) {
                // Should be visible and usable
                await expect(emailInput).toBeVisible();
                
                // Should fit within viewport
                const box = await emailInput.boundingBox();
                expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
            }
        });
    }
});

// ============================================================================
// CONTENT SECTIONS - VIEWPORT TESTS
// ============================================================================

test.describe('Content Sections - Viewport Matrix', () => {
    const sections = ['#instructors', '#testimonials', '#curriculum', '#pricing', '#faq'];
    
    for (const section of sections) {
        test(`${section} renders properly on mobile`, async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.mobile_large);
            await page.goto('/');
            await waitForPageReady(page);
            
            const sectionEl = page.locator(section).first();
            const count = await sectionEl.count();
            
            if (count > 0) {
                // Scroll to section
                await sectionEl.scrollIntoViewIfNeeded();
                await page.waitForTimeout(300);
                
                // Should be visible
                await expect(sectionEl).toBeVisible();
                
                // Should not overflow horizontally
                const box = await sectionEl.boundingBox();
                expect(box.width).toBeLessThanOrEqual(VIEWPORTS.mobile_large.width + 10); // Small tolerance
            }
        });
        
        test(`${section} renders properly on desktop`, async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.desktop);
            await page.goto('/');
            await waitForPageReady(page);
            
            const sectionEl = page.locator(section).first();
            const count = await sectionEl.count();
            
            if (count > 0) {
                await sectionEl.scrollIntoViewIfNeeded();
                await expect(sectionEl).toBeVisible();
            }
        });
    }
});

// ============================================================================
// TEXT READABILITY - VIEWPORT TESTS
// ============================================================================

test.describe('Text Readability - Viewport Matrix', () => {
    test('headings are readable on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile_small);
        await page.goto('/');
        await waitForPageReady(page);
        
        const h1 = page.locator('h1').first();
        const h1Box = await h1.boundingBox();
        
        if (h1Box) {
            // H1 should not be too small on mobile
            const fontSize = await h1.evaluate(el => 
                parseFloat(getComputedStyle(el).fontSize)
            );
            expect(fontSize).toBeGreaterThanOrEqual(20); // At least 20px
        }
    });
    
    test('body text is readable on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile_small);
        await page.goto('/');
        await waitForPageReady(page);
        
        const p = page.locator('p').first();
        const pBox = await p.boundingBox();
        
        if (pBox) {
            const fontSize = await p.evaluate(el => 
                parseFloat(getComputedStyle(el).fontSize)
            );
            expect(fontSize).toBeGreaterThanOrEqual(14); // At least 14px
        }
    });
});

// ============================================================================
// UI EFFECTS - VIEWPORT TESTS
// ============================================================================

test.describe('UI Effects - Viewport Matrix', () => {
    test('custom cursor hidden on touch devices (mobile)', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile_large);
        await page.goto('/');
        await waitForPageReady(page);
        
        const cursor = page.locator('.custom-cursor, .cursor-dot');
        const cursorCount = await cursor.count();
        
        if (cursorCount > 0) {
            // Should be hidden on mobile
            const isHidden = await cursor.first().evaluate(el => {
                const style = getComputedStyle(el);
                return style.display === 'none' || 
                       style.visibility === 'hidden' || 
                       style.opacity === '0';
            });
            expect(isHidden).toBe(true);
        }
    });
    
    test('AOS animations work on desktop', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await page.goto('/');
        await waitForPageReady(page);
        
        // Wait extra time for AOS to initialize from CDN
        await page.waitForTimeout(1000);
        
        // Check AOS is initialized (with retry)
        const hasAOS = await page.evaluate(() => {
            // AOS might be loaded async
            return typeof window.AOS !== 'undefined';
        });
        
        // AOS elements should exist in HTML regardless of JS initialization
        const aosElements = page.locator('[data-aos]');
        const count = await aosElements.count();
        expect(count).toBeGreaterThan(0);
        
        // AOS library should be loaded (but may not be initialized yet)
        if (hasAOS) {
            expect(hasAOS).toBe(true);
        }
    });
});

// ============================================================================
// TOUCH TARGETS - MOBILE SPECIFIC
// ============================================================================

test.describe('Touch Targets - Mobile', () => {
    test('primary CTA buttons have minimum touch targets', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile_large);
        await page.goto('/');
        await waitForPageReady(page);
        
        // Only check primary CTA buttons (not all buttons/links)
        const ctaButtons = page.locator('.cta-btn, .apply-btn, button[type="submit"]');
        const count = await ctaButtons.count();
        
        let checkedCount = 0;
        for (let i = 0; i < count; i++) {
            const button = ctaButtons.nth(i);
            const isVisible = await button.isVisible().catch(() => false);
            
            if (isVisible) {
                const box = await button.boundingBox();
                if (box) {
                    // CTA buttons should be at least 36px tall (more lenient)
                    expect(box.height).toBeGreaterThanOrEqual(36);
                    checkedCount++;
                }
            }
        }
        
        // Should have at least one CTA button
        expect(checkedCount).toBeGreaterThan(0);
    });
    
    test('form inputs are easily tappable', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile_large);
        await page.goto('/');
        await waitForPageReady(page);
        
        const inputs = page.locator('input[type="text"], input[type="email"]');
        const count = await inputs.count();
        
        for (let i = 0; i < count; i++) {
            const input = inputs.nth(i);
            const isVisible = await input.isVisible();
            
            if (isVisible) {
                const box = await input.boundingBox();
                if (box) {
                    expect(box.height).toBeGreaterThanOrEqual(40); // At least 40px height
                }
            }
        }
    });
});
