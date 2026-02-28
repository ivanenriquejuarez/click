// Browser Layer Types (internal function calls)
export interface BrowserTaskInput {
    taskId: string;
    url: string;
    selector: string;
    proxy?: string;
    mode: "headless" | "headed";
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
}

export interface BrowserTaskResult {
    taskId: string;
    status: "success" | "failed";
    currentState: string;
    duration: number;
    error?: string;
    errorCategory?: "NETWORK_ERROR" | "PROXY_ERROR"
        | "SELECTOR_NOT_FOUND" | "CLICK_FAILED"
        | "CONDITION_TIMEOUT" | "TIMEOUT";
}

// 1. Create Job (POST /api/jobs)
export interface CreateJobRequest {
    instanceCount: number;
    url: string;
    selector: string;
    mode?: "headless" | "headed";
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    proxies?: string[];
}

export interface CreateJobResponse {
    jobId: string;
    status: "idle" | "rejected";
    message?: string;
}

// 2. Get All Jobs (GET /api/jobs)
export interface JobSummary {
    jobId: string;
    url: string;
    selector: string;
    status: "idle" | "running" | "completed" | "failed" | "stopped" | "rejected";
    totalInstances: number;
    succeeded: number;
    failed: number;
}

export interface GetJobsResponse {
    jobs: JobSummary[];
}

// 3. Get One Job (GET /api/jobs/:id)
export interface InstanceSummary {
    taskId: string;
    proxy?: string;
    status: "pending" | "running" | "success" | "failed";
    currentState: "STARTING" | "NAVIGATING" | "FINDING_SELECTOR"
        | "CLICKING" | "DETECTING_PAGE" | "IN_QUEUE"
        | "WAITING" | "PASSED_QUEUE";
    logs: string[];
    duration: number;
    error?: string;
}

export interface GetOneJobResponse extends JobSummary {
    instances: InstanceSummary[];
}

// 4. Delete Job (DELETE /api/jobs/:id)
export interface DeleteJobResponse {
    jobId: string;
    status: "stopped" | "not_found";
    message: string;
}

// 5. Proxy Test (POST /api/proxies/test)
export interface ProxyTestRequest {
    proxies: string[];
    targetUrl: string;
}

export interface ProxyTestResult {
    proxy: string;
    status: "pass" | "fail";
    responseTimeMs?: number;
    error?: string;
}

export interface ProxyTestResponse {
    results: ProxyTestResult[];
}

// 6. WebSocket Messages (backend → frontend)
export interface InstanceStateChange {
    type: "state_change";
    jobId: string;
    taskId: string;
    state: "STARTING" | "NAVIGATING" | "FINDING_SELECTOR"
        | "CLICKING" | "DETECTING_PAGE" | "IN_QUEUE"
        | "WAITING" | "PASSED_QUEUE";
    timestamp: string;
}

export interface InstanceLog {
    type: "log";
    jobId: string;
    taskId: string;
    message: string;
    timestamp: string;
}

export interface InstanceCompleted {
    type: "instance_completed";
    jobId: string;
    taskId: string;
    status: "success" | "failed";
    error?: string;
    duration: number;
    timestamp: string;
}

export interface JobCompleted {
    type: "job_completed";
    jobId: string;
    totalInstances: number;
    succeeded: number;
    failed: number;
    duration: number;
    timestamp: string;
}