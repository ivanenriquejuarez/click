import type { BrowserTaskInput, BrowserTaskResult } from "../shared/types.js";
import { chromium } from 'playwright';
import type { Browser } from "playwright";

export async function runBrowserTask(input: BrowserTaskInput): Promise<BrowserTaskResult> {

    const startTime = Date.now();
    let browser: Browser | null = null;
    let currentState = "STARTING";

    try {
        // Step 1: Open Browser
        console.log("Step 1: Launching Chromium...");
        // Check if we are using proxy console log
        if (input.proxy) {
            console.log(`Using proxy: ${input.proxy}`);
        } else {
            console.log("Not proxy, using direct connection!");
        }
        browser = await chromium.launch({
            proxy: input.proxy ? { server: input.proxy } : undefined, // If proxy exists do if not its undefined
            headless: input.mode === "headless" 
        });

        currentState = "NAVIGATING";
        // Step 2: Go to page
        console.log("Step 2: Going to URL - ", input.url);
        const context = await browser.newContext({ ignoreHTTPSErrors: true});   // Create a context preferenece w bypass of http cert
        const page = await context.newPage();
        const response = await page.goto(input.url, { timeout: input.timeout}); // In playwright, {} are options object which are optional IF they happen do this

        currentState = "FINDING_SELECTOR";

        // Check if page loaded correctly
        if (!response || response.status() !== 200) {
            throw new Error(`Page failed to load - status ${response?.status()}`)
        }

        currentState = "CLICKING";
        // Step 3: Find 'Learn more' link and click
        await page.locator(input.selector).click({ timeout: input.timeout });
        console.log("Navigated to: ", page.url());

        // Step 4: Success or Failure
        return {
            taskId: input.taskId,
            status: "success",
            currentState: "PASSED_QUEUE",
            duration: Date.now() - startTime,
        };
    } catch (error) {
        // Failure
        return {
            taskId: input.taskId,
            status: "failed",
            currentState: currentState,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    } finally {
        await browser?.close(); // ? allows it to dictate if theres a window open or not (if it crashes, it will still close)
    }
}

(async () => {
    const result = await runBrowserTask({
        taskId: "test-001",
        url: "https://example.com",
        selector: "azzz",
        mode: "headless",
        timeout: 7000,
        retryAttempts: 0,
        retryDelay: 1000,
        proxy: "socks5://104.200.152.30:4145"
    });
    console.log(result);
})();