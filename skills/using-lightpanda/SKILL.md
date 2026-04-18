---
name: using-lightpanda
description: "Operates Lightpanda, a Zig-based headless browser with no rendering pipeline, as an AI agent's browser tool via native MCP or CDP. Covers MCP tool selection (goto, markdown, semantic_tree, interactiveElements, structuredData, click, fill), output mode strategy, the observe-decide-act loop, actions grounded in node IDs, token-efficient page reading, and Chrome fallback triggers. Use when browsing the web with Lightpanda, fetching or scraping pages, navigating and interacting with websites, extracting page content as markdown or structured data, clicking or filling form elements via Lightpanda MCP tools, or when the user mentions Lightpanda."
category: Agent Tooling
compatibility: "Requires lightpanda binary on PATH or a running lightpanda serve/mcp instance"
---

# Using Lightpanda

## What Lightpanda is

Lightpanda is a headless browser written in Zig with V8 for JavaScript and
html5ever for HTML parsing. It is **not** a Chromium fork. It deliberately
omits the entire rendering pipeline (layout, paint, compositing, GPU, font
and image decoding).

Three modes of operation:

- `lightpanda fetch <URL>` — one-shot CLI, dumps HTML or markdown to stdout.
- `lightpanda serve` — CDP WebSocket server; target for Puppeteer/Playwright.
- `lightpanda mcp` — native MCP stdio server exposing browser actions as tools.

Sub-100ms cold start. ~9–11× faster and ~9–16× less memory than headless
Chrome on equivalent workloads. Beta maturity — ~95% site compatibility.

## When Lightpanda won't work

Stop and use Chrome (or tell the user to) when:

- **Screenshots, PDF export, or pixel inspection** are needed — no renderer.
- **Bot-protected sites** (Cloudflare managed challenge, DataDome, Akamai,
  PerimeterX) — Lightpanda's fingerprint is trivially detectable.
- **Complex SPAs crash or stall** — ~5% failure tail on heavy React/Angular/Vue
  apps. Fall back rather than retrying.
- **Layout-dependent APIs** are required (`getBoundingClientRect` returns
  meaningless values, `IntersectionObserver` geometry is fake,
  `CanvasRenderingContext2D.getImageData` returns no real pixels).

## Starting Lightpanda

### MCP mode (preferred for agents)

```bash
LIGHTPANDA_DISABLE_TELEMETRY=true lightpanda mcp
```

Configure in an MCP client (e.g. Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "lightpanda": {
      "command": "lightpanda",
      "args": ["mcp"],
      "env": { "LIGHTPANDA_DISABLE_TELEMETRY": "true" }
    }
  }
}
```

### CDP mode (for Puppeteer/Playwright escape hatch)

```bash
LIGHTPANDA_DISABLE_TELEMETRY=true lightpanda serve --host 127.0.0.1 --port 9222
```

Connect via `puppeteer-core`. See
[references/01-cdp-and-configuration.md](references/01-cdp-and-configuration.md)
for connection details, LP.* extensions, cookies, and proxies.

### Key flags

| Flag                   | Meaning                                      | Default |
| ---------------------- | -------------------------------------------- | ------- |
| `--log-level`          | `debug`, `info`, `warn`, `error`             | `info`  |
| `--http_timeout`       | Max HTTP transfer time in ms (0 = never)     | `10000` |
| `--http_proxy`         | Proxy URL (supports basic auth inline)       | —       |
| `--proxy_bearer_token` | Bearer token for `Proxy-Authorization`       | —       |
| `--obey-robots`        | Respect `robots.txt`                         | off     |
| `--wait-until`         | Lifecycle event (`networkidle`) — fetch only | —       |
| `--dump`               | `html` or `markdown` — fetch only            | —       |

**Always** set `LIGHTPANDA_DISABLE_TELEMETRY=true` when starting Lightpanda.
Pass it as an environment variable in every invocation — `serve`, `mcp`,
and `fetch`.

## Core workflow: observe → decide → act

Every browser interaction follows three steps:

1. **Observe** — read the page with `markdown`, `semantic_tree`, or
   `interactiveElements`.
2. **Decide** — reason over the compact observation; plan the next action.
3. **Act** — call `goto`, `click(node ID)`, `fill(node ID, value)`.

After every `goto`, **re-observe**. Do not carry stale observations forward —
the page changed.

## MCP tools

| Tool                  | Purpose                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `goto`                | Navigate to a URL. Specify a wait strategy.                      |
| `markdown`            | Page content as CommonMark. Optional target node ID for scoping. |
| `semantic_tree`       | Semantic outline with stable node IDs.                           |
| `interactiveElements` | Only clickable/fillable elements with node IDs.                  |
| `structuredData`      | JSON-LD, OpenGraph, schema.org metadata.                         |
| `click`               | Click by **node ID** (not CSS selector).                         |
| `fill`                | Fill a form field by **node ID**.                                |
| `evaluate`            | Run arbitrary JS. Escape hatch for unusual cases.                |
| `waitForSelector`     | Wait until a CSS selector appears.                               |

## Choosing the right output

| Goal                                       | Tool                   | Typical tokens |
| ------------------------------------------ | ---------------------- | -------------- |
| Read an article or long text               | `markdown`             | 200–800        |
| Understand page structure to plan actions  | `semantic_tree`        | 400–1200       |
| Pick an element to click or fill           | `interactiveElements`  | 100–300        |
| Extract product/article metadata           | `structuredData`       | 100–400        |
| Custom extraction not covered above        | `evaluate`             | varies         |

### Output selection rules

- **Start with `markdown` for read-only research.** Do not pull the semantic
  tree unless planning to act on the page.
- **Call `interactiveElements` before any `click` or `fill`.** It is cheaper
  than `semantic_tree` and returns exactly the node IDs needed for action.
- **Use `semantic_tree` for structural reasoning** — "find the section titled
  X and extract the table under it."
- **Use `structuredData` first on product/article pages** — JSON-LD and
  OpenGraph are richer and more reliable than DOM extraction.
- **Scope `markdown` to a node ID** (from `semantic_tree`) for long pages.
  A full `markdown` on a dense page can consume thousands of tokens.

## Interaction rules

1. **Ground actions in node IDs.** MCP `click` and `fill` take node IDs
   returned by `semantic_tree` or `interactiveElements` — never hallucinate
   CSS selectors.
2. **Wait before acting.** After `goto`, verify expected content is present
   (call `markdown` or `waitForSelector`) before clicking. Networks are real,
   JS is async.
3. **Re-observe after navigation.** Every `goto` or `click` that triggers
   navigation invalidates prior observations.
4. **Abort on repeated failures.** If five consecutive tool calls error, stop
   and report the problem. Do not loop on broken selectors or crashed pages.
5. **Budget context.** Prefer `interactiveElements` (small) over
   `semantic_tree` (medium) over full `markdown` (large). Scope to a subtree
   via node ID when possible.
6. **Treat `evaluate` as a last resort.** Prefer the typed MCP tools; raw JS
   is harder to debug and easier to get wrong.

## Anti-patterns

- **Expecting screenshots or PDF export.** The rendering pipeline does not
  exist. Do not attempt `screenshot` — the tool is absent.
- **Using CSS selectors from LLM reasoning for `click`/`fill`.** Always use
  node IDs from `interactiveElements` or `semantic_tree`.
- **Carrying stale observations across navigations.** Re-observe after every
  page change.
- **Dumping full-page `markdown` on every turn.** Scope to a section or use
  `structuredData` when structured data is the goal.
- **Retrying endlessly on a failing page.** Lightpanda has a ~5% SPA
  incompatibility tail. After 2–3 failures on the same URL, report the issue
  and suggest a Chrome fallback.

## Chrome fallback

When a page fails (navigation timeout, JS crash, repeated empty output):

1. Report the failure to the user with the URL and error.
2. Suggest retrying with Chrome/Chromium if available.
3. Do not silently retry indefinitely — the failure is likely a compatibility
   gap, not a transient error.

## Example: multi-step form submission

**Task:** Navigate to a site, find and fill a search form, read results.

**Tool sequence:**

1. `goto` → `https://example.com` (wait: `networkidle`)
2. `interactiveElements` → returns list including `{id: 42, label: "Search", type: "input"}` and `{id: 43, label: "Submit", type: "button"}`
3. `fill` → node ID 42, value `"headless browser"`
4. `click` → node ID 43
5. `markdown` → returns rendered search results as CommonMark

**Key points:** step 2 grounds the action in real node IDs before step 3–4
attempt interaction. Step 5 re-observes after the navigation triggered by
the form submission.

## Reference material

- **CDP escape hatch, cookies, headers, proxies**: [references/01-cdp-and-configuration.md](references/01-cdp-and-configuration.md)
- **Troubleshooting and limitations**: [references/02-troubleshooting-and-limitations.md](references/02-troubleshooting-and-limitations.md)
