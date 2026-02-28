# API Contracts

## POST /api/jobs
### Frontend sends:
- url (required) - target URL
- selector (required) - CSS selector for the element
- instanceCount (required) - how many browser instances
- mode (optional) - "headless" or "headed", default headless
- timeout (optional) - ms before timeout, default 30000
- retryAttempts (optional) - how many retries, default 0
- retryDelay (optional) - ms between retries, default 1000
- proxies (optional) - list of proxy URLs

### Backend responds:
- jobId - unique ID for this job
- status - "idle" or "rejected"
- message - why it was rejected (only if rejected)

---

## GET /api/jobs
### Frontend sends:
Nothing

### Backend responds:
List of all jobs, each with:
- jobId
- url
- selector
- status (idle, running, completed, failed, stopped, rejected)
- totalInstances
- succeeded
- failed

---

## GET /api/jobs/:id
### Frontend sends:
Nothing (job ID is in the URL)

### Backend responds:
- jobId
- url
- selector
- status (idle, running, completed, failed, stopped, rejected)
- totalInstances
- succeeded
- failed
- instances (list, one per instance):
  - taskId
  - proxy (if applicable)
  - status (pending, running, success, failed)
  - currentState (STARTING, NAVIGATING, FINDING_SELECTOR,
    CLICKING, DETECTING_PAGE, IN_QUEUE, WAITING, PASSED_QUEUE)
  - logs (list of log messages)
  - duration
  - error (if failed)

---

## DELETE /api/jobs/:id
### Frontend sends:
Nothing (job ID is in the URL)

### Backend responds:
- jobId
- status ("stopped" or "not_found")
- message

---

## POST /api/proxies/test
### Frontend sends:
- proxies - list of proxy URLs
- targetUrl - the URL to test each proxy against

### Backend responds:
- results (list, one per proxy):
  - proxy
  - status ("pass" or "fail")
  - responseTimeMs
  - error (if failed)

---

## WebSocket Messages
Connection: ws://localhost:3000/ws

All messages are pushed from backend to frontend. The frontend
listens and updates the dashboard in real time.

### Instance State Change
Sent when an instance moves to a new state.
- type: "state_change"
- jobId
- taskId
- state (STARTING, NAVIGATING, FINDING_SELECTOR, CLICKING,
  DETECTING_PAGE, IN_QUEUE, WAITING, PASSED_QUEUE)
- timestamp

### Instance Log
Sent when an instance produces a log message.
- type: "log"
- jobId
- taskId
- message
- timestamp

### Instance Completed
Sent when an instance finishes (success or failure).
- type: "instance_completed"
- jobId
- taskId
- status ("success" or "failed")
- error (if failed)
- duration
- timestamp

### Job Completed
Sent when all instances in a job are done.
- type: "job_completed"
- jobId
- totalInstances
- succeeded
- failed
- duration
- timestamp