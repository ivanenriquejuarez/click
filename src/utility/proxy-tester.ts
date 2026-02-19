import { chromium } from "playwright";
import type { ProxyTestRequest, ProxyTestResult, ProxyTestResponse } from "../shared/types.js";
import type { Browser } from "playwright";

export async function proxyTester(input: ProxyTestRequest): Promise<ProxyTestResponse> {
    // Initialize variables
    const results: ProxyTestResult[] = [];

    // Step 1: Create a for loop that logs into each proxy and test
    for (const proxy of input.proxies) {
        console.log(`Testing proxy: ${proxy}...`)
        // Initialize Timer for proxy ms response
        const startTime = Date.now();
        let browser: Browser | null = null;

        // Try and Catch 
        try {
            // Open browser with playwright and insert proxy
            browser = await chromium.launch({
                proxy: {
                    server: `socks5://${proxy}`
                }
            });

            // Step 2: Create a page
            const page = await browser.newPage();

            // Step 3: Go to endpoint
            const response = await page.goto(input.targetUrl, { timeout: 10000});

            // Step 4: Check status
            const status = response?.status();

            // Step 5: Add to list if it pass
            if (status === 200) {
                console.log(`Proxy: ${proxy} passed`)
                results.push({
                    proxy: proxy,
                    status: "pass",
                    responseTimeMs: Date.now() - startTime,
                });
            } else {
                console.log(`Proxy ${proxy} failed - status ${status}`);
                results.push({
                    proxy: proxy,
                    status: "fail",
                    responseTimeMs: Date.now() - startTime,
                    error: `Received status code ${status}`,
                });
            }
        // Catch error
        } catch (error) {
            console.log(`Proxy ${proxy} failed - ${error instanceof Error ? error.message : "Unknown error"}`);
            results.push({
                proxy: proxy,
                status: "fail",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        // Finally to close browser
        } finally {
            await browser?.close();
        }
    }
    return { results }; // Return the list of successful proxies
}

// Test
(async () => {
    const result = await proxyTester({
        proxies: [
            "104.200.152.30:4145",
            "12.11.59.114:1080",
            "152.53.168.53:47857",
            "104.200.152.30:4145"
        ],
        targetUrl: "https://example.com"
    });
    console.log(result);
})();