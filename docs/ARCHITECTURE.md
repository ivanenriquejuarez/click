# Click - Architecture Document

## System Overview
React frontend where the user sets up and monitors jobs.
It talks to an Express backend that manages automation work.
Backend uses Playwright to open browsers and perform the actual clicking.
Frontend and Backend communicate via HTTP/WebSockets.

## Frontend
A simple UI dashboard that has two tabs: Tasks & Settings

1. Tasks: These tasks will have a start button associated with their
   own instance, pause, delete, and a brief logger that displays main
   logging such as: Task Started, Going to Link, Finding Selector,
   Found Selector, Accessing the Selector, Found New Page/Link,
   Awaiting Instructions, Awaiting..., (It will analyze if its a queue
   and once it finds it is out of the queue, it will display a success
   status code)
   a. Create a batch job that requires a URL link, Selector,
      Proxies (on or off).
   b. Future Job
2. Settings:
   a. Add proxies (unlimited) and test them to ping whatever site
      (endpoint) to ensure stability
   b. Retry MS editor

## Backend API
Express server running on localhost:3000

### Endpoints
- `POST /api/jobs` — Start a new job. Accepts URL, selector,
  instance count, mode, timeout, retry config. Returns a job ID.
- `GET /api/jobs` — Get all jobs and their current status.
- `GET /api/jobs/:id` — Get detailed status of a specific job
  including per-instance results.
- `DELETE /api/jobs/:id` — Cancel a running/idle job.
- `POST /api/proxies/test` — Accepts a list of proxies and a
  target URL. Tests each proxy against the URL and returns
  pass/fail with response times.

### WebSocket
- `ws://localhost:3000/ws` — Persistent connection that streams
  live updates to the frontend. Sends per-instance state changes,
  log messages, and job completion events in real time.

## Browser Automation Layer
Each browser instance is managed by Playwright and follows a
defined state machine.

### Instance States
```
STARTING → NAVIGATING → FINDING_SELECTOR → CLICKING →
DETECTING_PAGE → IN_QUEUE → WAITING → PASSED_QUEUE (success)
```

Each state transition is logged and streamed to the frontend
via WebSocket.

Failure can occur at any state:
- NAVIGATING → `NETWORK_ERROR`, `PROXY_ERROR`
- FINDING_SELECTOR → `SELECTOR_NOT_FOUND`
- CLICKING → `CLICK_FAILED`
- DETECTING_PAGE → `TIMEOUT`
- WAITING → `CONDITION_TIMEOUT`

### Orchestrator
The orchestrator manages all instances for a given job. It:
- Enforces the max concurrency limit (10 simultaneous instances)
- Queues remaining instances until a slot opens
- Tracks per-instance state and aggregates results
- Handles retry logic per the user's configuration
- Reports job-level summary when all instances complete

## Data Flow
1. User fills in the job form (URL, selector, instance count,
   proxy toggle, config options) and clicks "Start Job"
2. Frontend sends `POST /api/jobs` with the job configuration
3. Backend validates all inputs (URL format, selector not empty,
   instance count within limits)
4. If proxies are enabled, backend tests each proxy against the
   target URL via `POST /api/proxies/test` logic. If not enough
   proxies pass, the job is rejected and the frontend displays
   which proxies failed.
5. Backend creates a Job, assigns working proxies to instances,
   and passes the job to the orchestrator
6. Orchestrator launches instances up to the concurrency limit.
   Remaining instances are queued.
7. Each instance moves through the state machine:
   STARTING → NAVIGATING → FINDING_SELECTOR → CLICKING →
   DETECTING_PAGE → IN_QUEUE → WAITING → PASSED_QUEUE
8. On every state change, the backend sends an update through
   the WebSocket connection to the frontend
9. Frontend updates the live dashboard in real time — each
   instance shows its current state and log messages
10. When an instance completes (success or failure), the
    orchestrator launches the next queued instance
11. When all instances complete, the backend sends a job summary
    through WebSocket: total, succeeded, failed, duration,
    failure breakdown by error category
12. Frontend displays the final summary on the dashboard

## Future Enhancements
- **Record Mode**: User clicks "Record", a browser window opens,
  and the user manually performs the actions (navigate to URL,
  click an element). The tool captures the URL, selector, and
  action sequence automatically. User then specifies instance
  count and config, and the tool replays the recorded actions
  across all instances. This bypasses manual input of URL and
  selector for faster job setup.