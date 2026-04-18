# CDP Escape Hatch and Configuration

## Table of Contents

- [When to use CDP instead of MCP](#when-to-use-cdp-instead-of-mcp)
- [Connecting via Puppeteer](#connecting-via-puppeteer)
- [Lightpanda CDP extensions (LP.* domain)](#lightpanda-cdp-extensions-lp-domain)
- [Playwright — more brittle](#playwright--more-brittle)
- [Features that do not exist](#features-that-do-not-exist)
- [Cookies](#cookies)
- [Custom headers](#custom-headers)
- [Browser contexts for isolation](#browser-contexts-for-isolation)
- [Proxies](#proxies)

---

## When to use CDP instead of MCP

Drop to CDP when the MCP tool set is insufficient:

- Preseeding authentication cookies before navigation.
- Network interception via the CDP Fetch domain.
- Custom JS evaluation that requires a persistent CDP session.
- Workflows that need fine-grained lifecycle control (e.g., intercepting
  requests, modifying headers per-request).

For everything else, prefer MCP — it is more token-efficient and grounded
in stable node IDs.

## Connecting via Puppeteer

Start Lightpanda in serve mode, then connect with `puppeteer-core`:

```js
import puppeteer from "puppeteer-core";

const browser = await puppeteer.connect({
  browserWSEndpoint: "ws://127.0.0.1:9222",
});
const page = await browser.newPage();
await page.goto("https://example.com", { waitUntil: "networkidle2" });
```

Key rules:

- Use `puppeteer.connect`, not `puppeteer.launch`. Lightpanda is already
  running.
- Use `puppeteer-core`, not `puppeteer`, to skip the bundled Chromium
  download.
- Call `browser.disconnect()` when done, not `browser.close()` — the agent
  is a client, not the process owner.

Puppeteer has **higher compatibility** with Lightpanda than Playwright
because it issues raw CDP commands without probing for Chrome-internal
features.

## Lightpanda CDP extensions (LP.* domain)

Lightpanda adds a custom `LP` CDP domain with agent-oriented methods. Access
via a raw CDP session:

```js
const client = await page.target().createCDPSession();

const { markdown } = await client.send("LP.getMarkdown", {});
const { tree } = await client.send("LP.getSemanticTree", {});
const { elements } = await client.send("LP.getInteractiveElements", {});
const { data } = await client.send("LP.getStructuredData", {});
```

`LP.getMarkdown` accepts an optional target node ID to scope output to a
subtree — equivalent to the MCP `markdown` tool's scoping.

## Playwright — more brittle

Playwright works via `connectOverCDP` but is less stable:

```js
import { chromium } from "playwright";
const browser = await chromium.connectOverCDP("ws://127.0.0.1:9222");
```

Playwright probes the browser's feature surface and picks code paths
dynamically. When Lightpanda adds an API, Playwright may switch to a path
that depends on another API still missing. Scripts that work on nightly N
may break on N+1. Prefer Puppeteer when possible.

## Features that do not exist

These CDP calls will fail or return meaningless data:

- `Page.captureScreenshot` — no renderer.
- `Page.printToPDF` — no renderer.
- Coordinate-based `Input.dispatchMouseEvent` — no layout means coordinates
  are meaningless. Use DOM-driven `page.locator(...).click()` instead.
- `Emulation.setDeviceMetricsOverride` for visual viewport — no effect.
- `DOM.getBoxModel` / `getBoundingClientRect` — returns zeros or nonsense.

## Cookies

Puppeteer's cookie API works end-to-end:

```js
await page.setCookie({
  name: "session",
  value: process.env.SESSION_TOKEN,
  domain: "example.com",
  path: "/",
  httpOnly: true,
  secure: true,
});
await page.goto("https://example.com/account");
```

Cookies are isolated per browser context. `Set-Cookie` headers from server
responses are honored.

For authenticated scraping, **preseed a session cookie** rather than
scripting the login flow — faster, more reliable, less fragile.

## Custom headers

No dedicated `--user-agent` CLI flag exists. Set headers via the client:

```js
await page.setExtraHTTPHeaders({
  "User-Agent": "MyBot/1.0 (+https://my.site/bot)",
  "Accept-Language": "en-US,en;q=0.9",
});
```

Lightpanda's default User-Agent is distinctive. Set one explicitly for
polite crawling. This is **not** fingerprint evasion — other signals still
identify Lightpanda as automated.

## Browser contexts for isolation

Multiple isolated contexts share a process but have separate cookies,
localStorage, and cache:

```js
const ctx1 = await browser.createBrowserContext();
const ctx2 = await browser.createBrowserContext();
// ctx1 and ctx2 share no state.
```

**Concurrency caveat:** CDP in Lightpanda is typically limited to one
active connection per process and one page per context. Scale horizontally
across processes, not by adding contexts within one process.

## Proxies

Set at startup (process-global):

```bash
# Basic auth
LIGHTPANDA_DISABLE_TELEMETRY=true lightpanda serve \
  --http_proxy "http://user:pass@proxy.example:8080"

# Bearer token
LIGHTPANDA_DISABLE_TELEMETRY=true lightpanda serve \
  --http_proxy "http://proxy.example:8080" \
  --proxy_bearer_token "$TOKEN"
```

No built-in proxy rotation. For rotation, run multiple Lightpanda processes
each with a different `--http_proxy` and round-robin across them.

Set `--http_timeout` explicitly in proxy-backed deployments so dead
upstreams fail fast (e.g., `--http_timeout 15000`).
