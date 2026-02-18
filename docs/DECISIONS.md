## 001 - Playwright over Selenium
**Date:** 2026-02-18
**Context:** Tested both automation tools against sites with strong
anti-bot measures. FIFA and Stripe were test subjects — Playwright
was blocked by DaVinci and Cloudflare anti-bot systems, preventing
account creation. Selenium with Python bypassed these measures
successfully.
**Decision:** Playwright with TypeScript despite Selenium's better
anti-bot evasion.
**Reasoning:** I want to understand the ins and outs of Playwright
which will force me to explicitly write code for heavy error cases
and test cases — something that in Python with Selenium may be too
simple and abstracted. I want to learn in an unabstracted way.

## 002 - Full TypeScript stack over Python + TypeScript split
**Date:** 2026-02-18
**Context:** Considered using Python for the backend/automation
layer since Selenium with Python had better anti-bot results.
**Decision:** TypeScript for the entire stack — frontend, backend,
and browser automation.
**Reasoning:** TypeScript catches errors explicitly at compile time
before code runs. Using one language across the full stack reduces
complexity — no need to manage two codebases, two package managers,
and inter-service communication. Already familiar with React and
TypeScript on the frontend, so keeping the backend in the same
language means less context switching.