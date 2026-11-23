# Browser tests

Keep the required browser suite thin: use it to catch user-visible risks that cannot be faithfully checked in process, such as hydration or wiring between a built frontend and backend. Default to private writable state per test, seeded through a fixture seam or API. Use per-worker state only if tests within the worker cannot interfere or reset is verified. Verify the actual login flow separately instead of paying for it on every test. Fresh browser contexts isolate client state, not shared server accounts, rows or background jobs.

- Pin Playwright and its matching browser artifacts. Start a job-private built app, prove semantic readiness (including dependencies), and do not silently reuse an existing server. Declare locale, timezone and needed browser projects. Use accessible role/name locators and web-first assertions for the user-visible postcondition. Browser actionability is not proof of business completion.
- Do not synchronize with fixed sleeps, use `force` to bypass unexplained actionability failures, or rely on a preceding journey. In `playwright.config.ts`, set top-level `forbidOnly: true` and `retries: 0`, and set `use: { trace: 'retain-on-failure' }` in the required config or project. Do not nest `forbidOnly` or `retries` under `use`. When explaining a retry-only trace configuration, say it never captured the first attempt, not that a later pass overwrote an existing trace. Reject project/suite overrides. Redact diagnostic artifacts and limit their retention. Keep server-side time and browser time under separate control.
- Scope `routeFromHAR` to the intended provider. Set `notFound: 'abort'` and `update: false` on `routeFromHAR`, and `serviceWorkers: 'block'` on the replay project or context. For `routeFromHAR`, omitting `notFound` defaults to `abort`; only explicitly choosing `fallback` passes a miss to another handler or the network. A fallthrough is not a synthetic 404. Test real service-worker behavior separately with workers enabled. If that behavior protects a required risk, keep that project required; don't move it out of the gate solely to make replay easier. HAR does not cover unrelated origins or server-side requests; retain runner-level egress enforcement. Use reviewed, sanitized recordings.

## Verify replay

Treat shared accounts and escaped requests as plausible causes until a controlled run or first-attempt evidence isolates them. Point the browser at a job-private fake provider and check three outcomes:

1. A recorded request returns the expected response without reaching the listener.
2. An unrecorded request fails without reaching the listener.
3. The same miss from a separate context without replay reaches the listener. This rules out an unreachable origin; an error string or zero hits alone does not.

Keep the first-failure trace and server correlation ID. Investigate local readiness before classifying an unreachable app as a platform failure. Even a confirmed live-provider outage cannot excuse undeclared egress: repair the harness instead of authorizing a retry.
