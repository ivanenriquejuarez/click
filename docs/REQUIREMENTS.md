# ClickStorm - Requirements Document

## Summary
A localhost web application that automates browser instances to open a
target URL, click a specified element, and monitor for a success
condition (DOM change, redirect, or page state change). Each instance
can optionally operate through a unique proxy and reports results in
real time through a web-based GUI.

## Functional Requirements

### Inputs
- **Target URL**: A valid URL to open in each browser instance
- **CSS Selector**: A CSS selector identifying the element to click
  (found via browser dev tools inspection)
- **Success Condition**: What signals a successful outcome. One of:
  - URL changes to a different domain (redirect)
  - A specific DOM element appears or changes
  - Page text matches a specified value
- **Instance Count**: Number of browser instances to launch
  (1 to 250 headed, 1 to 1000 headless)
- **Proxy List** (optional): A list of proxy URLs. If provided,
  each instance is assigned a unique working proxy. Proxies are
  validated against the target URL before the job starts. Proxy
  count must be >= instance count. If no proxies are provided, all
  instances use the host machine's direct connection.
- **Mode**: Headless or headed (default: headless)
- **Timeout**: Max time per instance in ms (default: 30000)
- **Retry Attempts**: Number of retries on failure (default: 0)
- **Retry Delay**: Milliseconds to wait between retries
  (user-configurable, default: 1000)

### Behavior
1. User opens the web app at localhost
2. User fills in target URL, selector, success condition, instance
   count, proxy list, and configuration options
3. User clicks "Start Job"
4. Tool validates all inputs before launching any browsers:
   - URL is valid
   - Selector is not empty
   - Instance count is within limits
   - If proxies provided, proxy count >= instance count
5. If proxies are provided:
   a. Test each proxy by connecting to the target URL through it
   b. Report which proxies passed and which failed
   c. If not enough working proxies for the requested instance
      count, show the user which ones failed and stop the job
6. Assign each instance a unique working proxy (if proxies provided)
7. Instances launch up to the max concurrency limit
8. Each instance follows this sequence:
   a. Navigate to target URL (through assigned proxy if applicable)
   b. Wait for page to load
   c. Locate element matching CSS selector
   d. Click the element
   e. Monitor for the defined success condition
   f. Report success when condition is met, or fail on timeout
9. Results stream to the GUI in real time (per-instance logs)
10. Once all instances complete, a summary is displayed

### Outputs
- **Live Dashboard**: Real-time view of all instances and their
  current status (pending, running, success, failed)
- **Per-Instance Result**:
  - Task ID
  - Assigned proxy (if applicable)
  - Status (success or failure)
  - Duration (ms)
  - Error category and message (if failed)
- **Proxy Test Results** (if proxies provided):
  - Per-proxy status (pass/fail)
  - Response time per proxy
  - Total passed vs total failed
  - Clear indication if job cannot proceed due to insufficient
    working proxies
- **Job Summary**:
  - Total instances
  - Succeeded count
  - Failed count
  - Total job duration
  - Failure breakdown by error category

### Error Categories
- `NETWORK_ERROR` — page failed to load
- `PROXY_ERROR` — proxy connection failed or was rejected
- `PROXY_VALIDATION_FAILED` — proxy could not connect to target
  URL during pre-job testing
- `SELECTOR_NOT_FOUND` — element not found on page
- `CLICK_FAILED` — element found but click unsuccessful
- `CONDITION_TIMEOUT` — click succeeded but success condition
  was not met within timeout period
- `TIMEOUT` — general operation exceeded time limit

## Non-Functional Requirements
- **Max concurrency**: 10 simultaneous browser instances
- **Max total instances**: 250 headed or 1000 headless per job
- **Timeout default**: 30000ms
- **Retry default**: 0 attempts
- **Retry delay default**: 1000ms
- **Logging**: Structured, per-instance, with timestamps and task IDs
- **Resource awareness**: Tool should warn the user if requested
  instance count may exceed system capabilities

## Technology Constraints
- **Runtime**: Node.js (v20+)
- **Language**: TypeScript
- **Browser Automation**: Playwright
- **Backend**: Express.js REST API
- **Frontend**: React + TypeScript
- **Interface**: Web app served on localhost

## System Constraints
- Runs locally on host machine
- No cloud infrastructure required
- Resource usage (CPU/RAM) scales with instance count and mode
  (headed uses significantly more resources than headless)
- Current development machine: Mac Mini M4 Pro