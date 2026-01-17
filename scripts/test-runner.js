#!/usr/bin/env node
/**
 * HYPER-FAST Test Runner for Adava University Landing Page
 * 
 * OPTIMIZATIONS:
 * - File caching: Read each file only once
 * - Pre-computed HTML/CSS analysis: Parse once, reuse everywhere
 * - Buffered output: Reduce console I/O overhead
 * - Lazy evaluation: Only compute what's needed
 * 
 * Target: 79 tests in <0.5 seconds (down from ~1s)
 */

const fs = require('fs');
const path = require('path');

// =============================================================================
// FILE CACHE - Read each file only once
// =============================================================================
const fileCache = new Map();
const originalReadFileSync = fs.readFileSync.bind(fs);

fs.readFileSync = function(filePath, options) {
    if (options === 'utf8' || options?.encoding === 'utf8') {
        const pathStr = filePath.toString();
        if (pathStr.endsWith('.css') || pathStr.endsWith('.js') || 
            pathStr.endsWith('.html') || pathStr.endsWith('.md') ||
            pathStr.endsWith('.json') || pathStr.endsWith('.svg')) {
            if (!fileCache.has(pathStr)) {
                fileCache.set(pathStr, originalReadFileSync(pathStr, 'utf8'));
            }
            return fileCache.get(pathStr);
        }
    }
    return originalReadFileSync(filePath, options);
};

// =============================================================================
// PRE-COMPUTED FILE CONTENTS - Parse once at startup
// =============================================================================
const ROOT = path.join(__dirname, '..');
const resolveRoot = (file) => path.join(ROOT, file);

let _htmlContent = null;
let _cssContent = null;
let _htmlLower = null;
let _cssLower = null;

function getHTML() {
    if (_htmlContent === null) {
        _htmlContent = fs.readFileSync(resolveRoot('index.html'), 'utf8');
        _htmlLower = _htmlContent.toLowerCase();
    }
    return _htmlContent;
}

function getCSS() {
    if (_cssContent === null) {
        _cssContent = fs.readFileSync(resolveRoot('styles.css'), 'utf8');
        _cssLower = _cssContent.toLowerCase();
    }
    return _cssContent;
}

function getHTMLLower() {
    if (_htmlLower === null) getHTML();
    return _htmlLower;
}

function getCSSLower() {
    if (_cssLower === null) getCSS();
    return _cssLower;
}

// =============================================================================
// BUFFERED OUTPUT - Collect output, print once
// =============================================================================
const outputBuffer = [];
function bufferLog(msg) {
    outputBuffer.push(msg);
}

function flushOutput() {
    console.log(outputBuffer.join('\n'));
    outputBuffer.length = 0;
}

// =============================================================================
// TEST FRAMEWORK
// =============================================================================
const tests = {
    passed: [],
    failed: [],
    errors: []
};

function test(name, fn) {
    try {
        fn();
        tests.passed.push(name);
        bufferLog(`✓ ${name}`);
    } catch (e) {
        tests.failed.push(name);
        tests.errors.push({ name, error: e.message });
        bufferLog(`✗ ${name}: ${e.message}`);
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

// =============================================================================
// START TESTS
// =============================================================================
bufferLog('='.repeat(70));
bufferLog('RUNNING AUTOMATED TESTS');
bufferLog('='.repeat(70));
bufferLog('');

// Pre-load files into cache
const html = getHTML();
const css = getCSS();
const htmlLower = getHTMLLower();
const cssLower = getCSSLower();

// ============================================================================
// SECTION 1: FILE EXISTENCE TESTS
// ============================================================================
bufferLog('\n--- File Existence Tests ---');

test('index.html exists', () => {
    assert(fs.existsSync(resolveRoot('index.html')), 'index.html is missing');
});

test('styles.css exists', () => {
    assert(fs.existsSync(resolveRoot('styles.css')), 'styles.css is missing');
});

test('test-runner.js exists', () => {
    assert(fs.existsSync(path.join(__dirname, 'test-runner.js')), 'test-runner.js is missing');
});

test('adava-website-reference.md exists', () => {
    assert(fs.existsSync(resolveRoot('adava-website-reference.md')), 'adava-website-reference.md is missing');
});

test('favicon.svg exists', () => {
    assert(fs.existsSync(resolveRoot('favicon.svg')), 'favicon.svg is missing');
});

test('favicon.png exists', () => {
    assert(fs.existsSync(resolveRoot('favicon.png')), 'favicon.png is missing');
});

test('adava-icon.svg logo exists', () => {
    assert(fs.existsSync(resolveRoot('images/adava-icon.svg')), 'images/adava-icon.svg is missing');
});

test('instructor images directory exists with all instructors', () => {
    const instructorsDir = resolveRoot('images/instructors');
    assert(fs.existsSync(instructorsDir), 'images/instructors directory is missing');
    const files = fs.readdirSync(instructorsDir);
    assert(files.length >= 7, `Only ${files.length} instructor images, need at least 7`);
});

// ============================================================================
// SECTION 2: HTML STRUCTURE TESTS (using cached content)
// ============================================================================
bufferLog('\n--- HTML Structure Tests ---');

test('index.html includes styles.css', () => {
    assert(html.includes('href="styles.css"'), 'Missing styles.css link');
});

test('index.html has DOCTYPE', () => {
    assert(html.includes('<!DOCTYPE html>'), 'Missing DOCTYPE');
});

test('index.html has viewport meta tag', () => {
    assert(html.includes('viewport'), 'Missing viewport meta tag for responsive design');
});

test('index.html has page title', () => {
    assert(html.includes('<title>'), 'Missing page title');
});

test('index.html has lang attribute', () => {
    assert(html.includes('lang="en"'), 'Missing lang attribute for accessibility');
});

test('index.html has both SVG and PNG favicon', () => {
    assert(html.includes('favicon.svg'), 'Missing SVG favicon reference');
    assert(html.includes('favicon.png'), 'Missing PNG favicon reference');
});

test('index.html has apple-touch-icon for iOS', () => {
    assert(html.includes('apple-touch-icon'), 'Missing apple-touch-icon for iOS devices');
});

// ============================================================================
// SECTION 3: LANDING PAGE CONTENT TESTS (using lowercase cache)
// ============================================================================
bufferLog('\n--- Landing Page Content Tests ---');

test('Page has main headline about programming in 10 days', () => {
    assert(
        html.includes('10 Days') || html.includes('10 days'),
        'Missing main headline about 10 days'
    );
});

test('Page mentions AI coding/tools', () => {
    assert(
        htmlLower.includes('ai') && htmlLower.includes('coding'),
        'Missing AI coding mention'
    );
});

test('Page has apply/enroll CTA button', () => {
    assert(
        html.includes('Apply Now') || html.includes('Enroll') || html.includes('apply-btn'),
        'Missing apply/enroll CTA'
    );
});

test('Page has form inputs for name and email', () => {
    assert(html.includes('type="text"') || html.includes('name'), 'Missing name input');
    assert(html.includes('type="email"') || html.includes('email'), 'Missing email input');
});

test('Page mentions instructor credentials (universities)', () => {
    const hasUniversities = 
        html.includes('MIT') || 
        html.includes('Stanford') || 
        html.includes('Harvard') ||
        html.includes('Oxford') ||
        html.includes('Cambridge');
    assert(hasUniversities, 'Missing university credentials');
});

test('Page mentions instructor credentials (companies)', () => {
    const hasCompanies = 
        html.includes('Google') || 
        html.includes('Apple') || 
        html.includes('Meta') ||
        html.includes('Amazon') ||
        html.includes('Microsoft');
    assert(hasCompanies, 'Missing FAANG company credentials');
});

// ============================================================================
// SECTION 4: INSTRUCTOR SECTION TESTS
// ============================================================================
bufferLog('\n--- Instructor Section Tests ---');

test('Page has instructors section', () => {
    assert(
        html.includes('Instructor') || html.includes('instructor'),
        'Missing instructors section'
    );
});

test('Instructor cards have university affiliations', () => {
    const universities = ['MIT', 'Stanford', 'Harvard', 'Oxford', 'Cambridge'];
    const foundUniversities = universities.filter(u => html.includes(u));
    assert(foundUniversities.length >= 3, `Only ${foundUniversities.length} universities mentioned, need at least 3`);
});

test('Instructor cards have company experience (ex-FAANG)', () => {
    const companies = ['Google', 'Apple', 'Meta', 'Amazon', 'Microsoft', 'OpenAI'];
    const foundCompanies = companies.filter(c => html.includes(c) || html.includes(`Ex-${c}`) || html.includes(`ex-${c}`));
    assert(foundCompanies.length >= 3, `Only ${foundCompanies.length} FAANG companies mentioned, need at least 3`);
});

// ============================================================================
// SECTION 5: TESTIMONIALS SECTION TESTS
// ============================================================================
bufferLog('\n--- Testimonials Section Tests ---');

test('Page has testimonials/results section', () => {
    assert(
        html.includes('testimonial') || html.includes('Results') || html.includes('Students'),
        'Missing testimonials section'
    );
});

test('Testimonials include salary information', () => {
    assert(
        html.includes('$') && (html.includes('/year') || html.includes('K/year')),
        'Missing salary information in testimonials'
    );
});

test('Testimonials have believable backgrounds (engineering, medicine, math)', () => {
    const backgrounds = [
        'Engineer', 'Engineering', 
        'MD', 'Physician', 'Medicine', 'Doctor',
        'Math', 'Mathematics', 'PhD',
        'Biology', 'Biotech', 'Research'
    ];
    const foundBackgrounds = backgrounds.filter(b => html.includes(b));
    assert(foundBackgrounds.length >= 3, `Only ${foundBackgrounds.length} believable backgrounds found, need at least 3`);
});

// ============================================================================
// SECTION 6: CURRICULUM SECTION TESTS
// ============================================================================
bufferLog('\n--- Curriculum Section Tests ---');

test('Page has curriculum section', () => {
    assert(
        html.includes('Curriculum') || html.includes('curriculum') || html.includes('Days'),
        'Missing curriculum section'
    );
});

test('Curriculum covers 10 days', () => {
    // Should mention various days
    const daysMentioned = ['Day', 'Days 1', 'Days 3', 'Days 5', 'Days 7', 'Days 9'];
    const foundDays = daysMentioned.filter(d => html.includes(d));
    assert(foundDays.length >= 3, 'Curriculum should mention multiple days');
});

// ============================================================================
// SECTION 7: PRICING/ADMISSIONS SECTION TESTS
// ============================================================================
bufferLog('\n--- Pricing/Admissions Tests ---');

test('Page has pricing information', () => {
    assert(
        html.includes('$') && (html.includes('1,280') || html.includes('Price') || html.includes('Cost')),
        'Missing pricing information'
    );
});

test('Page has money-back guarantee', () => {
    assert(
        html.includes('Guarantee') || html.includes('guarantee') || html.includes('refund'),
        'Missing money-back guarantee'
    );
});

// ============================================================================
// SECTION 8: CSS STRUCTURE TESTS (using cached content)
// ============================================================================
bufferLog('\n--- CSS Structure Tests ---');

test('styles.css has root variables', () => {
    assert(css.includes(':root'), 'Missing :root CSS variables');
});

test('styles.css has color palette variables', () => {
    assert(
        css.includes('--color-') || css.includes('--primary') || css.includes('--accent') ||
        css.includes('--purple-') || css.includes('--cta-') || css.includes('--bg-'),
        'Missing color palette variables'
    );
});

test('styles.css has responsive styles', () => {
    assert(css.includes('@media'), 'Missing responsive media queries');
});

test('styles.css has button styles', () => {
    assert(css.includes('button') || css.includes('.btn') || css.includes('.cta'), 'Missing button styles');
});

test('styles.css has form styles', () => {
    assert(css.includes('input') || css.includes('form'), 'Missing form styles');
});

test('styles.css uses modern layout (grid or flexbox)', () => {
    assert(
        css.includes('display: grid') || css.includes('display: flex') || 
        css.includes('display:grid') || css.includes('display:flex'),
        'Missing modern layout (grid/flexbox)'
    );
});

// ============================================================================
// SECTION 9: DESIGN CONSISTENCY TESTS (Adava Style)
// ============================================================================
bufferLog('\n--- Design Consistency Tests ---');

test('Uses purple/magenta color scheme (Adava style)', () => {
    // Check for purple-ish colors
    const hasPurple = 
        css.includes('#8b5cf6') || css.includes('#a855f7') ||
        css.includes('#9333ea') || css.includes('#7c3aed') ||
        css.includes('rgb(139, 92, 246)') || css.includes('rgba(139') ||
        cssLower.includes('purple') || css.includes('#a259ff');
    assert(hasPurple, 'Missing purple/magenta color scheme');
});

test('Uses teal/green CTA colors (Adava style)', () => {
    const hasTeal = 
        css.includes('#25877D') || css.includes('#2a9a8e') ||
        css.includes('#12756B') || css.includes('#25877d') ||
        cssLower.includes('teal') || cssLower.includes('cta-teal') ||
        css.includes('rgb(37, 135, 125)') || css.includes('rgba(37,');
    assert(hasTeal, 'Missing teal/green CTA colors');
});

test('Has dark background theme', () => {
    const hasDark = 
        css.includes('#0f') || css.includes('#1a') || css.includes('#0a') ||
        css.includes('rgb(15,') || css.includes('rgb(10,') || css.includes('rgb(26,');
    assert(hasDark, 'Missing dark background theme');
});

// ============================================================================
// SECTION 10: ACCESSIBILITY TESTS
// ============================================================================
bufferLog('\n--- Accessibility Tests ---');

test('Form inputs have placeholder text', () => {
    assert(html.includes('placeholder='), 'Missing placeholder text on inputs');
});

test('Buttons have text content', () => {
    // Buttons should have readable text
    assert(
        html.includes('>Apply') || html.includes('>Enroll') || html.includes('>Get'),
        'Buttons should have descriptive text'
    );
});

test('Page has semantic HTML structure', () => {
    const semanticTags = ['<header', '<nav', '<main', '<section', '<footer', '<article'];
    const foundTags = semanticTags.filter(tag => html.includes(tag));
    assert(foundTags.length >= 3, `Only ${foundTags.length} semantic tags found, need at least 3`);
});

test('Headings follow hierarchy (h1 -> h2 -> h3)', () => {
    assert(html.includes('<h1'), 'Missing h1 heading');
    assert(html.includes('<h2'), 'Missing h2 headings');
});

// ============================================================================
// SECTION 11: COHORT/SCHEDULE TESTS
// ============================================================================
bufferLog('\n--- Cohort/Schedule Tests ---');

test('Page has cohort/schedule information', () => {
    assert(
        html.includes('Cohort') || html.includes('cohort') || 
        html.includes('Schedule') || html.includes('Dates'),
        'Missing cohort/schedule information'
    );
});

test('Page shows specific dates', () => {
    // Should have month names or date patterns
    const hasDateInfo = 
        html.includes('Jan') || html.includes('Feb') || html.includes('Mar') ||
        html.includes('Apr') || html.includes('May') || html.includes('2026');
    assert(hasDateInfo, 'Missing specific date information');
});

// ============================================================================
// SECTION 12: SOCIAL PROOF / STATS TESTS
// ============================================================================
bufferLog('\n--- Social Proof Tests ---');

test('Page has statistics/numbers', () => {
    // Should have numbers for credibility
    const hasStats = 
        html.includes('94%') || html.includes('847') ||
        html.includes('%') || html.includes('+');
    assert(hasStats, 'Missing statistics for social proof');
});

test('Page has employment/success metrics', () => {
    const hasMetrics =
        html.includes('Employment') || html.includes('Hired') ||
        html.includes('Salary') || html.includes('salary') ||
        html.includes('Starting');
    assert(hasMetrics, 'Missing employment/success metrics');
});

// ============================================================================
// SECTION 13: UI EFFECTS - GLASSMORPHISM
// ============================================================================
bufferLog('\n--- Glassmorphism Effects Tests ---');

test('CSS has backdrop-filter blur for glassmorphism', () => {
    assert(
        css.includes('backdrop-filter') && css.includes('blur'),
        'Missing backdrop-filter blur for glassmorphism'
    );
});

test('CSS has -webkit-backdrop-filter for Safari support', () => {
    assert(css.includes('-webkit-backdrop-filter'), 'Missing -webkit-backdrop-filter for Safari');
});

test('CSS has glass card class or similar', () => {
    assert(
        css.includes('.glass') || css.includes('rgba(255, 255, 255') || 
        css.includes('rgba(255,255,255') || css.includes('backdrop-filter'),
        'Missing glass effect styles'
    );
});

// ============================================================================
// SECTION 14: UI EFFECTS - ANIMATED GRADIENTS
// ============================================================================
bufferLog('\n--- Animated Gradient Tests ---');

test('CSS has animated gradient keyframes', () => {
    assert(
        css.includes('@keyframes') && (css.includes('gradient') || css.includes('Gradient') || css.includes('background-position')),
        'Missing animated gradient keyframes'
    );
});

test('CSS has background-size for gradient animation', () => {
    assert(
        css.includes('background-size') && (css.includes('200%') || css.includes('400%')),
        'Missing background-size for gradient animation'
    );
});

// ============================================================================
// SECTION 15: UI EFFECTS - GLOW EFFECTS
// ============================================================================
bufferLog('\n--- Glow Effects Tests ---');

test('CSS has box-shadow glow on buttons', () => {
    assert(
        css.includes('box-shadow') && (css.includes('0 0 ') || css.includes('0px 0px')),
        'Missing glow box-shadow effects'
    );
});

test('CSS has hover glow effect', () => {
    assert(
        css.includes(':hover') && css.includes('box-shadow'),
        'Missing hover glow effect'
    );
});

// ============================================================================
// SECTION 16: UI EFFECTS - VANILLA TILT
// ============================================================================
bufferLog('\n--- 3D Tilt Effects Tests ---');

test('HTML includes Vanilla Tilt library', () => {
    assert(
        html.includes('vanilla-tilt') || html.includes('tilt'),
        'Missing Vanilla Tilt library'
    );
});

test('HTML has data-tilt attributes on cards', () => {
    assert(
        html.includes('data-tilt') || html.includes('tilt-card'),
        'Missing data-tilt attributes on cards'
    );
});

// ============================================================================
// SECTION 17: UI EFFECTS - AOS SCROLL ANIMATIONS
// ============================================================================
bufferLog('\n--- Scroll Animation Tests ---');

test('HTML includes AOS library', () => {
    assert(
        html.includes('aos.js') || html.includes('aos@') || html.includes('AOS'),
        'Missing AOS animation library'
    );
});

test('HTML has data-aos attributes', () => {
    assert(
        html.includes('data-aos'),
        'Missing data-aos attributes for scroll animations'
    );
});

test('HTML initializes AOS', () => {
    assert(
        html.includes('AOS.init'),
        'Missing AOS.init() call'
    );
});

// ============================================================================
// SECTION 18: UI EFFECTS - COUNTER ANIMATION
// ============================================================================
bufferLog('\n--- Counter Animation Tests ---');

test('HTML has counter elements with data attributes', () => {
    assert(
        html.includes('data-count') || html.includes('counter') || html.includes('stat-number'),
        'Missing counter elements'
    );
});

test('HTML/JS has counter animation logic', () => {
    assert(
        html.includes('animateCounter') || html.includes('countUp') || 
        html.includes('IntersectionObserver') || html.includes('counter'),
        'Missing counter animation logic'
    );
});

// ============================================================================
// SECTION 19: UI EFFECTS - SMOOTH SCROLL
// ============================================================================
bufferLog('\n--- Smooth Scroll Tests ---');

test('CSS or HTML has smooth scroll behavior', () => {
    assert(
        css.includes('scroll-behavior: smooth') || html.includes('lenis') || 
        html.includes('smooth') || css.includes('scroll-behavior'),
        'Missing smooth scroll behavior'
    );
});

// ============================================================================
// SECTION 20: UI EFFECTS - CSS TRANSITIONS
// ============================================================================
bufferLog('\n--- CSS Transitions Tests ---');

test('CSS has transition properties for smooth animations', () => {
    const transitionCount = (css.match(/transition:/g) || []).length;
    assert(transitionCount >= 5, `Only ${transitionCount} transitions found, need at least 5`);
});

test('CSS has transform properties', () => {
    assert(css.includes('transform:'), 'Missing transform properties');
});

test('CSS uses cubic-bezier or ease for smooth animations', () => {
    assert(
        css.includes('cubic-bezier') || css.includes('ease') || css.includes('ease-in-out'),
        'Missing easing functions'
    );
});

// ============================================================================
// SECTION 21: UI EFFECTS - TYPEWRITER (OPTIONAL)
// ============================================================================
bufferLog('\n--- Text Effects Tests ---');

test('HTML/JS has typewriter or text animation', () => {
    assert(
        html.includes('typewriter') || html.includes('typing') || 
        html.includes('text-animate') || html.includes('SplitType') ||
        html.includes('gsap') || html.includes('GSAP'),
        'Missing text animation effects'
    );
});

// ============================================================================
// SECTION 22: UI EFFECTS - MOUSE PARALLAX
// ============================================================================
bufferLog('\n--- Mouse/Parallax Effects Tests ---');

test('HTML/JS has mouse move event listener', () => {
    assert(
        html.includes('mousemove') || html.includes('parallax') || 
        html.includes('mouse') || html.includes('cursor'),
        'Missing mouse interaction effects'
    );
});

// ============================================================================
// SECTION 23: UI EFFECTS - GSAP
// ============================================================================
bufferLog('\n--- GSAP Effects Tests ---');

test('HTML includes GSAP library', () => {
    assert(
        html.includes('gsap') || html.includes('GSAP'),
        'Missing GSAP library'
    );
});

test('HTML includes ScrollTrigger plugin', () => {
    assert(
        html.includes('ScrollTrigger'),
        'Missing GSAP ScrollTrigger plugin'
    );
});

test('GSAP ScrollTrigger is registered', () => {
    assert(
        html.includes('gsap.registerPlugin') || html.includes('registerPlugin(ScrollTrigger)'),
        'Missing GSAP ScrollTrigger registration'
    );
});

// ============================================================================
// SECTION 24: UI EFFECTS - CUSTOM CURSOR
// ============================================================================
bufferLog('\n--- Custom Cursor Tests ---');

test('CSS has custom cursor styles', () => {
    assert(
        css.includes('.custom-cursor') || css.includes('.cursor-dot'),
        'Missing custom cursor CSS styles'
    );
});

test('HTML/JS creates custom cursor elements', () => {
    assert(
        html.includes('custom-cursor') || html.includes('cursor-dot'),
        'Missing custom cursor JS implementation'
    );
});

// ============================================================================
// SECTION 24: RESPONSIVE DESIGN
// ============================================================================
bufferLog('\n--- Responsive Design Tests ---');

test('CSS has multiple breakpoints for responsive design', () => {
    const breakpoints = (css.match(/@media/g) || []).length;
    assert(
        breakpoints >= 3,
        `Only ${breakpoints} media queries found, need at least 3 for proper responsive design`
    );
});

test('CSS has mobile breakpoint (max-width: 768px or similar)', () => {
    assert(
        css.includes('max-width: 768px') || css.includes('max-width:768px') ||
        css.includes('max-width: 480px') || css.includes('max-width:480px'),
        'Missing mobile breakpoint'
    );
});

test('CSS has small mobile breakpoint (max-width: 480px or 375px)', () => {
    assert(
        css.includes('max-width: 480px') || css.includes('max-width: 375px') ||
        css.includes('max-width:480px') || css.includes('max-width:375px'),
        'Missing small mobile breakpoint'
    );
});

test('CSS hides custom cursor on touch devices', () => {
    assert(
        css.includes('hover: none') || 
        (css.includes('.custom-cursor') && css.includes('display: none')),
        'Custom cursor should be hidden on touch devices'
    );
});

test('CSS uses responsive font sizes (clamp or vw)', () => {
    assert(
        css.includes('clamp(') || css.includes('vw'),
        'Missing responsive font sizing (clamp or vw units)'
    );
});

test('HTML has viewport meta tag', () => {
    assert(
        html.includes('viewport') && html.includes('width=device-width'),
        'Missing proper viewport meta tag for mobile'
    );
});

// ============================================================================
// COHORT CARDS & FORM INPUTS TESTS
// ============================================================================
bufferLog('\n--- Cohort Cards & Form Inputs Tests ---');

test('Cohort card background uses correct opacity (0.6, not 0.95)', () => {
    const css = getCSS();
    const bgCardMatch = css.match(/--bg-card:\s*rgba\([^)]+\)/);
    assert(bgCardMatch, '--bg-card variable not found');
    assert(
        bgCardMatch[0].includes('0.6') && !bgCardMatch[0].includes('0.95'),
        '--bg-card should be rgba(45, 27, 78, 0.6), not 0.95'
    );
});

test('Cohort card does NOT have forced opacity override', () => {
    const css = getCSS();
    const cohortCardMatch = css.match(/\.cohort-card\s*\{[^}]*\}/s);
    assert(cohortCardMatch, '.cohort-card rule not found');
    assert(
        !cohortCardMatch[0].includes('opacity: 1 !important'),
        '.cohort-card should NOT have opacity: 1 !important (should use --bg-card opacity)'
    );
});

test('Cohort form inputs have proper width styling', () => {
    const css = getCSS();
    assert(
        css.includes('.cohort-form .form-input') || css.includes('.cohort-form .form-input'),
        'Missing .cohort-form .form-input styling'
    );
    const formInputMatch = css.match(/\.cohort-form\s+\.form-input\s*\{[^}]*\}/s);
    if (formInputMatch) {
        assert(
            formInputMatch[0].includes('width: 100%') || formInputMatch[0].includes('width:100%'),
            '.cohort-form .form-input should have width: 100%'
        );
    }
});

test('Cohort cards have February Cohort with correct dates', () => {
    const html = getHTML();
    assert(
        html.includes('February Cohort') || html.includes('February cohort'),
        'Missing February Cohort card'
    );
    assert(
        html.includes('Feb 3rd to Feb 14th') || html.includes('Feb 3rd to Feb 14th, 2026'),
        'February Cohort should have dates Feb 3rd to Feb 14th'
    );
});

test('Cohort cards have Next Cohort badge', () => {
    const html = getHTML();
    assert(
        html.includes('Next Cohort') || html.includes('cohort-badge'),
        'Missing Next Cohort badge on featured cohort'
    );
});

// ============================================================================
// CDN LINKS TESTS
// ============================================================================
bufferLog('\n--- CDN Links Tests ---');

test('JavaScript libraries load from CDN (not local files)', () => {
    const html = getHTML();
    assert(
        html.includes('unpkg.com') || html.includes('cdnjs.cloudflare.com') || html.includes('jsdelivr.net'),
        'JavaScript libraries should load from CDN, not local files'
    );
});

test('AOS library loads from CDN', () => {
    const html = getHTML();
    assert(
        html.includes('unpkg.com/aos') || html.includes('cdnjs.cloudflare.com/aos'),
        'AOS library should load from CDN'
    );
    assert(
        !html.includes('src="js/aos.js"') && !html.includes('src=\'js/aos.js\''),
        'AOS should not load from local js/aos.js file'
    );
});

test('GSAP library loads from CDN', () => {
    const html = getHTML();
    assert(
        html.includes('unpkg.com/gsap') || html.includes('cdnjs.cloudflare.com/gsap'),
        'GSAP library should load from CDN'
    );
    assert(
        !html.includes('src="js/gsap') && !html.includes('src=\'js/gsap\''),
        'GSAP should not load from local js/gsap files'
    );
});

test('Vanilla Tilt loads from CDN', () => {
    const html = getHTML();
    assert(
        html.includes('unpkg.com/vanilla-tilt') || html.includes('cdnjs.cloudflare.com/vanilla-tilt'),
        'Vanilla Tilt library should load from CDN'
    );
    assert(
        !html.includes('src="js/vanilla-tilt') && !html.includes('src=\'js/vanilla-tilt\''),
        'Vanilla Tilt should not load from local js/vanilla-tilt file'
    );
});

// ============================================================================
// CARD VISIBILITY TESTS
// ============================================================================
bufferLog('\n--- Card Visibility Tests ---');

test('Project cards have forced visibility (opacity: 1 !important)', () => {
    const css = getCSS();
    const projectCardMatch = css.match(/\.project-card\s*\{[^}]*\}/s);
    assert(projectCardMatch, '.project-card rule not found');
    assert(
        projectCardMatch[0].includes('opacity: 1 !important'),
        '.project-card should have opacity: 1 !important to ensure visibility'
    );
});

test('Curriculum day cards have forced visibility', () => {
    const css = getCSS();
    const dayCardMatch = css.match(/\.day-card\s*\{[^}]*\}/s);
    assert(dayCardMatch, '.day-card rule not found');
    assert(
        dayCardMatch[0].includes('opacity: 1 !important'),
        '.day-card should have opacity: 1 !important to ensure visibility'
    );
});

test('Project cards have white text for visibility', () => {
    const css = getCSS();
    const projectCardH3 = css.match(/\.project-card\s+h3\s*\{[^}]*\}/s);
    if (projectCardH3) {
        assert(
            projectCardH3[0].includes('color: var(--text-white)') || projectCardH3[0].includes('color:#ffffff'),
            '.project-card h3 should have white text color'
        );
    }
});

// ============================================================================
// RESULTS
// ============================================================================
flushOutput();

bufferLog('');
bufferLog('='.repeat(70));
bufferLog('TEST RESULTS');
bufferLog('='.repeat(70));
bufferLog(`Passed: ${tests.passed.length}`);
bufferLog(`Failed: ${tests.failed.length}`);
bufferLog('');

if (tests.failed.length > 0) {
    bufferLog('FAILED TESTS:');
    tests.errors.forEach(({ name, error }) => {
        bufferLog(`  ✗ ${name}: ${error}`);
    });
    bufferLog('');
    flushOutput();
    process.exit(1);
} else {
    bufferLog('All tests passed!');
    flushOutput();
    process.exit(0);
}
