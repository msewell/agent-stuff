# Troubleshooting and Limitations

## Table of Contents

- [Triage workflow](#triage-workflow)
- [Common errors and fixes](#common-errors-and-fixes)
- [Hard limits (by design)](#hard-limits-by-design)
- [Beta gaps (improving weekly)](#beta-gaps-improving-weekly)
- [Platform gaps](#platform-gaps)
- [Handling beta instability](#handling-beta-instability)

---

## Triage workflow

1. Re-run with `--log-level debug --log-format pretty`.
2. Sanity-check the install against the known-good demo page:

   ```bash
   LIGHTPANDA_DISABLE_TELEMETRY=true lightpanda fetch --dump html \
     https://demo-browser.lightpanda.io/campfire-commerce/
   ```

3. Isolate the failure to a single URL — strip the pipeline to the minimum
   reproducing case.
4. Search the GitHub issue tracker — most crashes are already tracked.
5. File a report with: OS, Lightpanda version (`lightpanda --version`), full
   CLI invocation, debug logs, and the reproducing URL.

## Common errors and fixes

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `bind: address already in use` on 9222 | Another process holds the port | `lsof -ti:9222 \| xargs kill -9` or `--port 9223` |
| Permission denied running binary | Missing chmod | `chmod +x ./lightpanda` |
| Playwright `connectOverCDP` segfaults | Known crash in certain nightlies | Try a different nightly; use Puppeteer instead |
| `V8 BadStatusCode` during module load | ESM fetch failed (404 on a script) | Check the page's script sources — often a CDN quirk |
| Hangs after `mutation event handler error` | MutationObserver bug on specific sites | Fall back to Chrome for that URL |
| CDP clients disconnect after 10s | Default `--timeout 10` | Increase: `--timeout 300` |
| All pages timeout through proxy | Missing auth or wrong scheme | Verify `--http_proxy` URL; try `--proxy_bearer_token` |
| Works locally, fails in Docker on Alpine | glibc required (binary is not musl) | Use Debian/Ubuntu base image |
| "Element not clickable at point" | Coordinate-based click fallback | Use DOM-driven `page.locator(...).click()` |
| JS runs but nothing visible changes | You expected rendering | There is no renderer — query DOM instead |
| Empty markdown output on SPA | JS-rendered content not loaded yet | Add `--wait-until networkidle` or `waitForSelector` |

## Hard limits (by design)

These are architectural choices, not missing features:

- **No rendering** — no screenshots, no PDF, no canvas pixels, no layout
  geometry. This will never change.
- **Single context per process** in most CDP configurations. Scale by
  running more processes.
- **Easily detectable fingerprint** — not a stealth browser. JS-visible
  properties (`window.chrome`, `navigator.plugins`, canvas, WebGL) either
  don't exist or mismatch real Chrome. Anti-bot vendors classify Lightpanda
  as a known headless client.

## Beta gaps (improving weekly)

- Complex SPAs (heavy React/Angular/Vue) can crash or stall.
- Some CDP methods are unimplemented; Playwright may hit those gaps.
- Advanced Network manipulation beyond Fetch interception is partial.
- Performance domain metrics are incomplete vs Chrome.
- Service workers / Web Workers: partial support.
- WebRTC, WebGL, WebGPU, WebAssembly surrounding APIs: may be missing.

## Platform gaps

- **Windows:** no native binary. Use WSL2 or Docker.
- **Intel macOS:** no binary. Use Docker or build from source.
- **Alpine / musl Linux:** glibc-linked only. Use a glibc base image.
- **Build from source** requires Zig **0.15.2** exactly (not 0.14).

## Handling beta instability

- Pin to a specific nightly tag or image digest — never use the floating
  `:nightly` tag in production.
- Upgrade deliberately: test on staging, keep a rollback image.
- Monitor fallback ratio as a leading indicator — a spike after a version
  bump signals a regression.
- Watch the upstream Discord for heads-up on known-broken builds.
