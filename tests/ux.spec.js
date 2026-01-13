// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * UX Tests for AdaVa University Landing Page
 * 
 * Tags:
 * - @smoke: Critical tests for quick validation
 * - @mobile: Mobile-specific tests
 * - @visual: Visual verification tests
 */

// Helper to wait for page to be ready
async function waitForPageReady(page) {
    await page.waitForLoadState('domcontentloaded');
    // Wait for AOS to initialize
    await page.waitForTimeout(500);
}

// ============================================================================
// SMOKE TESTS - Critical path, run these frequently
// ============================================================================

test.describe('Smoke Tests @smoke', () => {
    test('page loads successfully with title @smoke', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/AdaVa|University|AI|Coding/i);
    });

    test('main hero section is visible @smoke', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Hero should be visible (use first matching or header.hero)
        const hero = page.locator('header.hero, .hero-section, #hero').first();
        await expect(hero).toBeVisible();
    });

    test('CTA button is visible and clickable @smoke', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Should have a CTA button (apply, enroll, or similar)
        const ctaButton = page.locator('.cta-btn, .apply-btn, a.btn, button.btn, [class*="cta"]').first();
        await expect(ctaButton).toBeVisible({ timeout: 10000 });
    });

    test('navigation works @smoke', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Should have nav element or nav links
        const nav = page.locator('nav').first();
        await expect(nav).toBeVisible();
    });

    test('form inputs are functional @smoke', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Should have email input at minimum
        const emailInput = page.locator('input[type="email"]').first();
        await expect(emailInput).toBeVisible({ timeout: 10000 });
        
        // Should be able to type in it
        await emailInput.fill('test@example.com');
        await expect(emailInput).toHaveValue('test@example.com');
    });

    test('page has proper semantic structure @smoke', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Should have header and footer at minimum
        await expect(page.locator('header').first()).toBeVisible();
        await expect(page.locator('footer').first()).toBeVisible();
    });
});

// ============================================================================
// CONTENT TESTS - Verify all required content exists
// ============================================================================

test.describe('Content Tests', () => {
    test('instructors section exists with credentials', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Should have instructors section
        const instructorsSection = page.locator('#instructors, .instructors, section:has-text("Instructor")');
        await expect(instructorsSection).toBeVisible();
        
        // Should mention universities
        const pageContent = await page.content();
        expect(pageContent).toMatch(/MIT|Stanford|Harvard|Oxford|Cambridge/);
    });

    test('testimonials section exists with salary info', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Should have testimonials
        const testimonialsSection = page.locator('#testimonials, .testimonials, section:has-text("Student")');
        await expect(testimonialsSection).toBeVisible();
        
        // Should have salary info
        const pageContent = await page.content();
        expect(pageContent).toMatch(/\$[\d,]+/);
    });

    test('curriculum section shows 10-day program', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        const pageContent = await page.content();
        expect(pageContent).toMatch(/10\s*Days?/i);
        expect(pageContent).toMatch(/Day\s*[1-9]|Days?\s*[1-9]/i);
    });

    test('pricing section shows course cost', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        const pageContent = await page.content();
        expect(pageContent).toMatch(/\$1,?280|\$1280/);
    });

    test('money-back guarantee is mentioned', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        const pageContent = await page.content();
        expect(pageContent).toMatch(/guarantee|refund/i);
    });

    test('cohort dates are shown', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        const pageContent = await page.content();
        expect(pageContent).toMatch(/2026|Jan|Feb|Mar|Apr|May/);
    });
});

// ============================================================================
// UI EFFECTS TESTS - Verify visual effects work
// ============================================================================

test.describe('UI Effects Tests', () => {
    test('AOS animations are initialized', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Check that AOS is loaded
        const hasAOS = await page.evaluate(() => typeof window.AOS !== 'undefined');
        expect(hasAOS).toBe(true);
        
        // Check that elements have data-aos attributes
        const aosElements = page.locator('[data-aos]');
        const count = await aosElements.count();
        expect(count).toBeGreaterThan(0);
    });

    test('GSAP is loaded', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        const hasGSAP = await page.evaluate(() => typeof window.gsap !== 'undefined');
        expect(hasGSAP).toBe(true);
    });

    test('Vanilla Tilt cards have 3D effect', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Check for tilt elements
        const tiltElements = page.locator('[data-tilt]');
        const count = await tiltElements.count();
        expect(count).toBeGreaterThan(0);
    });

    test('smooth scroll is enabled', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Check for Lenis or CSS smooth scroll
        const hasLenis = await page.evaluate(() => typeof window.lenis !== 'undefined');
        const hasSmoothCSS = await page.evaluate(() => {
            return getComputedStyle(document.documentElement).scrollBehavior === 'smooth';
        });
        
        expect(hasLenis || hasSmoothCSS).toBe(true);
    });

    test('glassmorphism effects are applied', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Find elements with backdrop-filter
        const glassElements = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            let count = 0;
            elements.forEach(el => {
                const style = getComputedStyle(el);
                if (style.backdropFilter && style.backdropFilter !== 'none') {
                    count++;
                }
            });
            return count;
        });
        
        expect(glassElements).toBeGreaterThan(0);
    });
});

// ============================================================================
// RESPONSIVE TESTS - Mobile and tablet views
// ============================================================================

test.describe('Responsive Tests @mobile', () => {
    test('mobile viewport shows proper layout', async ({ page }) => {
        await page.setViewportSize({ width: 430, height: 932 });
        await page.goto('/');
        await waitForPageReady(page);
        
        // Hero should be visible
        const hero = page.locator('.hero, #hero, section:first-of-type');
        await expect(hero).toBeVisible();
        
        // CTA should be visible
        const cta = page.locator('.cta-btn, .apply-btn, a[href*="apply"]').first();
        await expect(cta).toBeVisible();
    });

    test('mobile navigation works', async ({ page }) => {
        await page.setViewportSize({ width: 430, height: 932 });
        await page.goto('/');
        await waitForPageReady(page);
        
        // Should have a mobile menu button or visible nav
        const mobileMenuBtn = page.locator('.mobile-menu-btn, .hamburger, .menu-toggle');
        const navVisible = page.locator('nav');
        
        const hasMobileMenu = await mobileMenuBtn.count() > 0;
        const hasVisibleNav = await navVisible.isVisible();
        
        expect(hasMobileMenu || hasVisibleNav).toBe(true);
    });

    test('forms are usable on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 430, height: 932 });
        await page.goto('/');
        await waitForPageReady(page);
        
        // Find form inputs
        const emailInput = page.locator('input[type="email"]').first();
        await expect(emailInput).toBeVisible();
        
        // Should be able to tap and type
        await emailInput.tap();
        await emailInput.fill('mobile@test.com');
        await expect(emailInput).toHaveValue('mobile@test.com');
    });

    test('tablet viewport renders correctly', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/');
        await waitForPageReady(page);
        
        // All sections should be visible
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('main, .main-content')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
    });

    test('custom cursor is hidden on touch devices', async ({ page }) => {
        await page.setViewportSize({ width: 430, height: 932 });
        await page.goto('/');
        await waitForPageReady(page);
        
        // Custom cursor should be hidden or not exist on mobile
        const cursor = page.locator('.custom-cursor, .cursor-dot');
        const cursorCount = await cursor.count();
        
        if (cursorCount > 0) {
            // If exists, should be hidden
            const isHidden = await cursor.first().evaluate(el => {
                const style = getComputedStyle(el);
                return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
            });
            expect(isHidden).toBe(true);
        }
    });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

test.describe('Accessibility Tests', () => {
    test('page has proper heading hierarchy', async ({ page }) => {
        await page.goto('/');
        
        // Should have h1
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBeGreaterThanOrEqual(1);
        
        // Should have h2s
        const h2Count = await page.locator('h2').count();
        expect(h2Count).toBeGreaterThan(0);
    });

    test('images have alt text', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Get all images
        const images = page.locator('img');
        const imageCount = await images.count();
        
        if (imageCount > 0) {
            // Check at least some have alt text
            const imagesWithAlt = page.locator('img[alt]');
            const withAltCount = await imagesWithAlt.count();
            expect(withAltCount).toBeGreaterThan(0);
        }
    });

    test('form inputs have labels or placeholders', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        const inputs = page.locator('input[type="text"], input[type="email"]');
        const inputCount = await inputs.count();
        
        for (let i = 0; i < inputCount; i++) {
            const input = inputs.nth(i);
            const hasPlaceholder = await input.getAttribute('placeholder');
            const hasAriaLabel = await input.getAttribute('aria-label');
            const id = await input.getAttribute('id');
            const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false;
            
            expect(hasPlaceholder || hasAriaLabel || hasLabel).toBeTruthy();
        }
    });

    test('buttons are keyboard accessible', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Tab to first button
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        
        // Should have focus on an interactive element
        const focusedElement = page.locator(':focus');
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
        
        expect(['a', 'button', 'input', 'select', 'textarea']).toContain(tagName);
    });
});

// ============================================================================
// INTERACTION TESTS
// ============================================================================

test.describe('Interaction Tests', () => {
    test('clicking nav links scrolls to sections', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Find a nav link with hash
        const navLink = page.locator('nav a[href^="#"]').first();
        const linkCount = await navLink.count();
        
        if (linkCount > 0) {
            const initialScroll = await page.evaluate(() => window.scrollY);
            await navLink.click();
            await page.waitForTimeout(1000); // Wait for scroll
            const newScroll = await page.evaluate(() => window.scrollY);
            
            // Should have scrolled
            expect(newScroll).not.toBe(initialScroll);
        }
    });

    test('FAQ accordion expands on click', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Find FAQ items
        const faqItem = page.locator('.faq-item, .accordion-item, details').first();
        const faqCount = await faqItem.count();
        
        if (faqCount > 0) {
            // Click to expand
            await faqItem.click();
            await page.waitForTimeout(300);
            
            // Should show answer
            const answer = faqItem.locator('.faq-answer, .accordion-content, p');
            await expect(answer).toBeVisible();
        }
    });

    test('hover effects work on cards', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        
        // Find a card with tilt
        const card = page.locator('[data-tilt], .instructor-card, .testimonial-card').first();
        const cardCount = await card.count();
        
        if (cardCount > 0) {
            // Hover over it
            await card.hover();
            await page.waitForTimeout(300);
            
            // Check transform is applied
            const hasTransform = await card.evaluate(el => {
                const style = getComputedStyle(el);
                return style.transform !== 'none' && style.transform !== '';
            });
            
            // Should have some transform effect
            expect(hasTransform).toBe(true);
        }
    });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

test.describe('Performance Tests', () => {
    test('page loads within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
        const loadTime = Date.now() - startTime;
        
        // Should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
    });

    test('no console errors on page load', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        await page.goto('/');
        await waitForPageReady(page);
        
        // Filter out expected errors (like failed network requests for external resources)
        const criticalErrors = errors.filter(err => 
            !err.includes('net::ERR') && 
            !err.includes('Failed to load resource') &&
            !err.includes('favicon')
        );
        
        expect(criticalErrors.length).toBe(0);
    });
});
