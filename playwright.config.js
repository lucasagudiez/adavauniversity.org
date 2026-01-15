// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const os = require('os');

/**
 * HYPER-FAST Playwright Configuration for Adava University
 * Target: All tests in <10 seconds
 * 
 * Optimizations:
 * - Max parallelism (all CPU cores)
 * - Minimal timeouts
 * - No artifacts collection locally
 * - Chromium only by default
 * - Headless mode
 */

const isCI = !!process.env.CI;
const cpuCount = os.cpus().length;

module.exports = defineConfig({
    testDir: './tests',
    
    /* HYPER PARALLEL - use all CPU cores */
    fullyParallel: true,
    workers: isCI ? 4 : cpuCount, // All cores locally
    
    forbidOnly: isCI,
    retries: 0, // No retries for speed
    maxFailures: 0, // Run all tests even if some fail
    
    /* Fast but realistic timeouts */
    timeout: 30000, // 30s per test max (libraries need time to load)
    expect: {
        timeout: 5000, // 5s for assertions
    },
    
    /* Minimal reporter */
    reporter: [['list', { printSteps: false }]],
    
    use: {
        baseURL: 'http://localhost:8888',
        
        /* Fast timeouts */
        actionTimeout: 10000, // 10s for actions (AOS/GSAP need time)
        navigationTimeout: 30000, // 30s for page loads (many CDN libraries)
        
        /* Minimal artifacts - screenshots on failure for debugging */
        trace: 'off',
        screenshot: 'only-on-failure',
        video: 'off',
        
        /* Headless with GPU acceleration (faster rendering) */
        headless: true,
        
        /* Disable animations via CSS prefers-reduced-motion */
        reducedMotion: 'reduce',
        
        launchOptions: {
            args: [
                '--disable-extensions',  // Skip loading extensions
                '--disable-dev-shm-usage', // Prevent memory issues
            ],
        },
    },

    /* Single browser - Chromium only by default */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'Mobile Chrome',
            use: { ...devices['iPhone 15 Pro Max'] },
        },
    ],

    /* Fast server - npx http-server is 10x faster than Python */
    webServer: {
        command: 'npx http-server . -p 8888 -c-1 --silent',
        url: 'http://localhost:8888',
        reuseExistingServer: true,
        timeout: 30000,  // 30s for server startup
        stdout: 'ignore',
        stderr: 'pipe',
    },
});
