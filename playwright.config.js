// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const os = require('os');

/**
 * Playwright Configuration for Adava University Landing Page
 * 
 * Optimizations:
 * - Max parallelism (all CPU cores)
 * - Minimal timeouts for fast feedback
 * - Chromium only by default
 * - Headless mode
 */

const isCI = !!process.env.CI;
const cpuCount = os.cpus().length;

module.exports = defineConfig({
    testDir: './tests',
    
    /* Run serially for stability */
    fullyParallel: false,
    workers: 1,
    
    forbidOnly: isCI,
    retries: 0,
    maxFailures: 0,
    
    /* Timeouts */
    timeout: 30000, // 30s per test max (page has many libraries)
    expect: {
        timeout: 5000, // 5s for assertions
    },
    
    /* Minimal reporter */
    reporter: [['list', { printSteps: false }]],
    
    use: {
        baseURL: 'http://localhost:8888',
        
        /* Timeouts - allow for library loading */
        actionTimeout: 10000,
        navigationTimeout: 30000,
        
        /* Minimal artifacts */
        trace: 'off',
        screenshot: 'only-on-failure',
        video: 'off',
        
        /* Headless */
        headless: true,
        
        /* Disable animations */
        reducedMotion: 'reduce',
        
        launchOptions: {
            args: ['--disable-extensions'],
        },
    },

    /* Single browser - Chromium only */
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

    /* Web server */
    webServer: {
        command: 'npx http-server . -p 8888 -c-1',
        url: 'http://localhost:8888',
        reuseExistingServer: true,
        timeout: 30000,  // 30s for server startup
        stdout: 'ignore',
        stderr: 'pipe',
    },
});
