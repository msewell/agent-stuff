import { mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DEFAULT_MAX_BYTES,
  DEFAULT_MAX_LINES,
  formatSize,
  truncateHead,
  withFileMutationQueue,
  type TruncationResult,
} from "@earendil-works/pi-coding-agent";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { StringEnum } from "@earendil-works/pi-ai";
import { Type, type Static } from "typebox";

const API_URL = "https://api.search.brave.com/res/v1/llm/context";
const CONFIG_PATH = join(process.env.HOME ?? "~", ".pi", "agent", "brave-llm-context.json");
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;

const searchParams = Type.Object({
  query: Type.String({
    minLength: 1,
    maxLength: 400,
    description: "Web search query (1–400 characters; at most 50 words).",
  }),
  country: Type.Optional(Type.String({ description: "Two-letter country code, or ALL." })),
  search_lang: Type.Optional(Type.String({ description: "Preferred result language, such as en." })),
  count: Type.Optional(Type.Integer({ minimum: 1, maximum: 50, description: "Results to consider." })),
  freshness: Type.Optional(Type.String({ description: "pd, pw, pm, py, or YYYY-MM-DDtoYYYY-MM-DD." })),
  maximum_number_of_urls: Type.Optional(
    Type.Integer({ minimum: 1, maximum: 50, description: "Maximum source URLs returned." }),
  ),
  maximum_number_of_tokens: Type.Optional(
    Type.Integer({ minimum: 1024, maximum: 32768, description: "Approximate context-token budget." }),
  ),
  maximum_number_of_snippets: Type.Optional(
    Type.Integer({ minimum: 1, maximum: 100, description: "Maximum snippets across all sources." }),
  ),
  maximum_number_of_tokens_per_url: Type.Optional(
    Type.Integer({ minimum: 512, maximum: 8192, description: "Maximum context tokens from one URL." }),
  ),
  maximum_number_of_snippets_per_url: Type.Optional(
    Type.Integer({ minimum: 1, maximum: 100, description: "Maximum snippets from one URL." }),
  ),
  context_threshold_mode: Type.Optional(
    StringEnum(["strict", "balanced", "lenient", "disabled"] as const, {
      description: "Relevance filter; balanced is the default.",
    }),
  ),
  goggles: Type.Optional(Type.String({ description: "A hosted Goggle URL or inline Goggle definition." })),
  enable_local: Type.Optional(Type.Boolean({ description: "Enable or disable location-aware recall." })),
  latitude: Type.Optional(Type.Number({ minimum: -90, maximum: 90, description: "Location latitude for local search." })),
  longitude: Type.Optional(Type.Number({ minimum: -180, maximum: 180, description: "Location longitude for local search." })),
  city: Type.Optional(Type.String({ description: "City for local search when coordinates are unavailable." })),
  state: Type.Optional(Type.String({ description: "State or region code for local search." })),
  state_name: Type.Optional(Type.String({ description: "State or region name for local search." })),
  postal_code: Type.Optional(Type.String({ description: "Postal code for local search." })),
  location_country: Type.Optional(Type.String({ description: "Two-letter country code for local search." })),
});

type SearchParams = Static<typeof searchParams>;
type JsonRecord = Record<string, unknown>;

type Config = {
  apiKey: string;
  defaults?: JsonRecord;
};

type GroundingItem = {
  url?: unknown;
  title?: unknown;
  name?: unknown;
  snippets?: unknown;
};

type SearchDetails = {
  query: string;
  retrievedAt: string;
  resultCount: number;
  sourceUrls: string[];
  request: JsonRecord;
  truncation?: TruncationResult;
  fullOutputPath?: string;
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asItems(value: unknown): GroundingItem[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function asSnippets(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((snippet): snippet is string => typeof snippet === "string" && snippet.length > 0)
    : [];
}

function defaultValue(defaults: JsonRecord | undefined, key: string, fallback: unknown): unknown {
  return defaults?.[key] ?? fallback;
}

async function loadConfig(): Promise<Config> {
  let raw: string;
  try {
    raw = await readFile(CONFIG_PATH, "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      throw new Error(`Brave LLM Context is not configured. Add an API key to ${CONFIG_PATH}.`);
    }
    throw new Error(`Unable to read Brave LLM Context configuration at ${CONFIG_PATH}.`);
  }

  const fileMode = (await stat(CONFIG_PATH)).mode & 0o777;
  if ((fileMode & 0o077) !== 0) {
    throw new Error(`Refusing to read ${CONFIG_PATH} because it is accessible by other users. Run: chmod 600 ${CONFIG_PATH}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Brave LLM Context configuration at ${CONFIG_PATH} is not valid JSON.`);
  }

  if (!isRecord(parsed) || typeof parsed.apiKey !== "string") {
    throw new Error(`Brave LLM Context configuration at ${CONFIG_PATH} must contain an "apiKey" string.`);
  }

  if (!parsed.apiKey.trim() || parsed.apiKey === "YOUR_BRAVE_SEARCH_API_KEY") {
    throw new Error(`Add your Brave Search API key to "apiKey" in ${CONFIG_PATH}.`);
  }

  return {
    apiKey: parsed.apiKey.trim(),
    defaults: isRecord(parsed.defaults) ? parsed.defaults : undefined,
  };
}

function validateQuery(query: string): void {
  if (query.trim().split(/\s+/).length > 50) {
    throw new Error("Brave LLM Context queries may contain at most 50 words.");
  }
}

function makeRequestBody(params: SearchParams, defaults: JsonRecord | undefined): JsonRecord {
  const body: JsonRecord = {
    q: params.query,
    country: params.country ?? defaultValue(defaults, "country", "US"),
    search_lang: params.search_lang ?? defaultValue(defaults, "search_lang", "en"),
    count: params.count ?? defaultValue(defaults, "count", 10),
    maximum_number_of_urls:
      params.maximum_number_of_urls ?? defaultValue(defaults, "maximum_number_of_urls", 10),
    maximum_number_of_tokens:
      params.maximum_number_of_tokens ?? defaultValue(defaults, "maximum_number_of_tokens", 4096),
    maximum_number_of_snippets:
      params.maximum_number_of_snippets ?? defaultValue(defaults, "maximum_number_of_snippets", 25),
    maximum_number_of_tokens_per_url:
      params.maximum_number_of_tokens_per_url ?? defaultValue(defaults, "maximum_number_of_tokens_per_url", 2048),
    maximum_number_of_snippets_per_url:
      params.maximum_number_of_snippets_per_url ?? defaultValue(defaults, "maximum_number_of_snippets_per_url", 10),
    context_threshold_mode:
      params.context_threshold_mode ?? defaultValue(defaults, "context_threshold_mode", "balanced"),
  };

  const optionalBodyFields: Array<keyof SearchParams> = ["freshness", "goggles", "enable_local"];
  for (const field of optionalBodyFields) {
    const value = params[field] ?? defaults?.[field];
    if (value !== undefined) body[field] = value;
  }

  return body;
}

function makeLocationHeaders(params: SearchParams): Record<string, string> {
  const headers: Record<string, string> = {};
  if (params.latitude !== undefined) headers["X-Loc-Lat"] = String(params.latitude);
  if (params.longitude !== undefined) headers["X-Loc-Long"] = String(params.longitude);
  if (params.city) headers["X-Loc-City"] = params.city;
  if (params.state) headers["X-Loc-State"] = params.state;
  if (params.state_name) headers["X-Loc-State-Name"] = params.state_name;
  if (params.postal_code) headers["X-Loc-Postal-Code"] = params.postal_code;
  if (params.location_country) headers["X-Loc-Country"] = params.location_country;
  return headers;
}

function combineSignal(signal: AbortSignal | undefined): AbortSignal {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

function retryDelay(response: Response | undefined, attempt: number): number {
  const retryAfter = response?.headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 10_000);
  }
  return 500 * 2 ** attempt;
}

function sleep(milliseconds: number, signal: AbortSignal | undefined): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new Error("Brave LLM Context request cancelled."));
      },
      { once: true },
    );
  });
}

async function responseError(response: Response): Promise<Error> {
  const body = (await response.text()).slice(0, 2000).trim();
  let message = body;
  try {
    const json = JSON.parse(body) as JsonRecord;
    message = asString(json.message) ?? asString(json.error) ?? body;
  } catch {
    // A plain-text error body is still useful.
  }
  const suffix = message ? `: ${message}` : "";
  return new Error(`Brave LLM Context request failed (${response.status} ${response.statusText})${suffix}`);
}

async function requestContext(
  body: JsonRecord,
  apiKey: string,
  locationHeaders: Record<string, string>,
  signal: AbortSignal | undefined,
): Promise<unknown> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    let response: Response | undefined;
    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Subscription-Token": apiKey,
          ...locationHeaders,
        },
        body: JSON.stringify(body),
        signal: combineSignal(signal),
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error instanceof Error ? error : new Error("Brave LLM Context request failed.");
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(retryDelay(undefined, attempt), signal);
        continue;
      }
      break;
    }

    if (response.ok) {
      try {
        return await response.json();
      } catch {
        throw new Error("Brave LLM Context returned an invalid JSON response.");
      }
    }

    lastError = await responseError(response);
    if (![408, 429, 500, 502, 503, 504].includes(response.status)) throw lastError;
    if (attempt < MAX_ATTEMPTS - 1) {
      await sleep(retryDelay(response, attempt), signal);
    }
  }

  throw lastError ?? new Error("Brave LLM Context request failed.");
}

function formatItem(item: GroundingItem, sources: JsonRecord): string | undefined {
  const url = asString(item.url);
  const title = asString(item.title) ?? asString(item.name) ?? url;
  const snippets = asSnippets(item.snippets);
  if (!title && snippets.length === 0) return undefined;

  const lines = [title ?? "Untitled result"];
  if (url) lines.push(url);

  const source = url && isRecord(sources[url]) ? sources[url] : undefined;
  const hostname = source ? asString(source.hostname) : undefined;
  const age = source && Array.isArray(source.age) ? asString(source.age[1]) ?? asString(source.age[0]) : undefined;
  if (hostname || age) lines.push([hostname, age].filter(Boolean).join(" · "));

  if (snippets.length > 0) lines.push("", ...snippets);
  return lines.join("\n");
}

function formatResponse(query: string, payload: unknown): { text: string; sourceUrls: string[]; resultCount: number } {
  if (!isRecord(payload)) throw new Error("Brave LLM Context returned an unexpected response shape.");

  const grounding = isRecord(payload.grounding) ? payload.grounding : {};
  const sources = isRecord(payload.sources) ? payload.sources : {};
  const groups: Array<[string, GroundingItem[]]> = [
    ["Web results", asItems(grounding.generic)],
    ["Point of interest", isRecord(grounding.poi) ? [grounding.poi] : []],
    ["Map results", asItems(grounding.map)],
  ];

  const sections: string[] = [`Brave LLM Context results for: ${query}`];
  const sourceUrls: string[] = [];
  let resultCount = 0;

  for (const [heading, items] of groups) {
    const entries = items
      .map((item) => {
        const url = asString(item.url);
        if (url && !sourceUrls.includes(url)) sourceUrls.push(url);
        return formatItem(item, sources);
      })
      .filter((entry): entry is string => entry !== undefined);

    if (entries.length > 0) {
      resultCount += entries.length;
      sections.push(`## ${heading}\n\n${entries.map((entry, index) => `### ${index + 1}\n${entry}`).join("\n\n")}`);
    }
  }

  if (resultCount === 0) sections.push("No relevant grounding content was returned.");
  return { text: sections.join("\n\n"), sourceUrls, resultCount };
}

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "brave_llm_context",
    label: "Brave LLM Context",
    description: `Search the web through Brave LLM Context and return extracted, relevance-ranked page content. Default retrieval is 10 results and about 4,096 context tokens. Tool output is capped at ${DEFAULT_MAX_LINES} lines or ${formatSize(DEFAULT_MAX_BYTES)}.`,
    promptSnippet: "Search current web information and retrieve extracted source content",
    promptGuidelines: [
      "Use brave_llm_context when fresh web information materially helps answer the task; use local project tools for repository questions.",
      "Use brave_llm_context's default limits for ordinary research and increase limits only when broader or deeper coverage is needed.",
    ],
    parameters: searchParams,
    async execute(_toolCallId, params, signal, _onUpdate) {
      validateQuery(params.query);
      const config = await loadConfig();
      const body = makeRequestBody(params, config.defaults);
      const payload = await requestContext(body, config.apiKey, makeLocationHeaders(params), signal);
      const formatted = formatResponse(params.query, payload);
      const truncation = truncateHead(formatted.text, {
        maxLines: DEFAULT_MAX_LINES,
        maxBytes: DEFAULT_MAX_BYTES,
      });

      const details: SearchDetails = {
        query: params.query,
        retrievedAt: new Date().toISOString(),
        resultCount: formatted.resultCount,
        sourceUrls: formatted.sourceUrls,
        request: body,
      };
      let text = truncation.content;

      if (truncation.truncated) {
        const directory = await mkdtemp(join(tmpdir(), "pi-brave-llm-context-"));
        const outputPath = join(directory, "results.md");
        await withFileMutationQueue(outputPath, async () => writeFile(outputPath, formatted.text, "utf8"));
        details.truncation = truncation;
        details.fullOutputPath = outputPath;
        text += `\n\n[Output truncated: showing ${truncation.outputLines} of ${truncation.totalLines} lines (${formatSize(truncation.outputBytes)} of ${formatSize(truncation.totalBytes)}). Full output saved to: ${outputPath}]`;
      }

      return {
        content: [{ type: "text", text }],
        details,
      };
    },
  });
}
