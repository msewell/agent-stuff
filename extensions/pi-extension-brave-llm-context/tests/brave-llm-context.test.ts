import { readFile, stat } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs/promises", async (importOriginal) => {
  const original = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...original,
    readFile: vi.fn(),
    stat: vi.fn(),
  };
});

import braveLlmContextExtension from "../extensions/brave-llm-context";

type ToolDefinition = {
  execute: (
    toolCallId: string,
    params: Record<string, unknown>,
    signal?: AbortSignal,
    onUpdate?: unknown,
  ) => Promise<{ content: Array<{ type: string; text: string }>; details: Record<string, unknown> }>;
};

function registerTool(): ToolDefinition {
  let tool: ToolDefinition | undefined;
  braveLlmContextExtension({
    registerTool(definition: ToolDefinition) {
      tool = definition;
    },
  } as never);

  if (!tool) throw new Error("Brave LLM Context tool was not registered.");
  return tool;
}

function configuredFile(defaults: Record<string, unknown> = {}) {
  vi.mocked(readFile).mockResolvedValue(
    JSON.stringify({
      apiKey: "test-api-key",
      defaults,
    }),
  );
  vi.mocked(stat).mockResolvedValue({ mode: 0o100600 } as Awaited<ReturnType<typeof stat>>);
}

function successfulPayload() {
  return {
    grounding: {
      generic: [
        {
          title: "Example source",
          url: "https://example.com/article",
          snippets: ["Extracted source content."],
        },
      ],
    },
    sources: {
      "https://example.com/article": {
        hostname: "example.com",
        age: ["published", "2026-01-01"],
      },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("brave_llm_context", () => {
  it("rejects a missing configuration before making a network request", async () => {
    vi.mocked(readFile).mockRejectedValue({ code: "ENOENT" });
    const tool = registerTool();

    await expect(tool.execute("call-1", { query: "test query" })).rejects.toThrow(
      "Brave LLM Context is not configured",
    );

    expect(fetch).not.toHaveBeenCalled();
  });

  it("retries a transient response and returns grouped source content", async () => {
    configuredFile({ country: "ALL", search_lang: "en" });
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response("temporarily unavailable", { status: 503, statusText: "Service Unavailable" }))
      .mockResolvedValueOnce(new Response(JSON.stringify(successfulPayload()), { status: 200 }));
    const tool = registerTool();

    const result = await tool.execute("call-2", { query: "current example" });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body))).toMatchObject({
      q: "current example",
      country: "ALL",
      search_lang: "en",
      count: 10,
      maximum_number_of_tokens: 4096,
    });
    expect(result.content[0]?.text).toContain("## Web results");
    expect(result.content[0]?.text).toContain("https://example.com/article");
    expect(result.content[0]?.text).toContain("Extracted source content.");
    expect(result.details).toMatchObject({
      resultCount: 1,
      sourceUrls: ["https://example.com/article"],
    });
  });
});
