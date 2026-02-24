import { runBrowserTask } from "@/browser/browser.task.js";
import type { BrowserTaskInput, CreateJobRequest, GetOneJobResponse } from "@/shared/types.js";
import pLimit from 'p-limit';

export async function runJob(input: CreateJobRequest): Promise<GetOneJobResponse> {
    // Step 1: Give each job an id
    const jobId = crypto.randomUUID();
    const tasks: BrowserTaskInput[] = [];

    // Step 2: Assign a proxy to each job
    for (let i = 0; i < input.instanceCount; i++) {
        tasks.push({
            taskId: `${i}`,
            url: input.url,
            selector: input.selector,
            proxy: input.proxies?.[i],
            mode: input.mode ?? "headless",
            timeout: input.timeout ?? 30000,
            retryAttempts: input.retryAttempts ?? 0,
            retryDelay: input.retryDelay ?? 10000
        });
    }

    // Step 4: Start parallel
    const limit = pLimit(10);

    // Initialize the parallel plimit
    const promises = tasks.map(task => 
        limit(() => runBrowserTask(task))
    )

    // Return results
    const results = await Promise.all(promises);

    // Calculate success and failures
    const succeeded = results.filter(r => r.status === "success").length;
    const failed = results.filter(r => r.status === "failed").length;
    const status = failed === input.instanceCount ? "failed" : "completed";

    // Return Promise
    return {
        jobId: jobId,
        url: input.url,
        selector: input.selector,
        status: status,
        totalInstances: input.instanceCount,
        succeeded: succeeded,
        failed: failed,
        instances: results.map(r => ({
            taskId: r.taskId,
            status: r.status === "success" ? "success" : "failed",
            currentState: r.currentState as any,
            logs: [],
            duration: r.duration,
            error: r.error,
        }))
    };
}

(async () => {
    const result = await runJob({
        url: "https://example.com",
        selector: "a",
        instanceCount: 20,
    });
    console.log(JSON.stringify(result, null, 2));
})();