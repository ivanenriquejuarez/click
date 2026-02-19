import type { BrowserTaskInput, BrowserTaskResult } from "../shared/types.js";
import { chromium } from 'playwright';
import type { Browser } from "playwright";

export async function runBrowserTask(input: BrowserTaskInput): Promise<BrowserTaskResult> {
    const startTime = Date.now();
    let browser: Browser | null = null;
    try {
        // Step 1: Open Browser
        console.log("Step 1: Launching Chromium...");
        browser = await chromium.launch();

        // Step 2: Go to page
        console.log("Step 2: Going to URL - ", input.url);
        const page = await browser.newPage();
        await page.goto(input.url);

        // Step 3: Find 'Learn more' link and click
        await page.locator(input.selector).click();
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
            currentState: "STARTING",
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
        selector: "a",
        mode: "headless",
        timeout: 30000,
        retryAttempts: 0,
        retryDelay: 1000
    });
    console.log(result);
})();