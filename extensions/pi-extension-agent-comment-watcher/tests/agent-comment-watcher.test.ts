import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import agentCommentWatcherExtension from "../extensions/agent-comment-watcher";

type CommandResult = {
  stdout: string;
  stderr: string;
  code: number | null;
  killed: boolean;
};

type ToolDefinition = {
  execute: (
    toolCallId: string,
    params: { action: "start" | "stop" | "status"; directories?: string[] },
  ) => Promise<{ content: Array<{ type: "text"; text: string }>; details: Record<string, unknown> }>;
};

type CommandDefinition = {
  handler: (args: string, ctx: TestContext) => Promise<void>;
};

type SessionHandler = (event: unknown, ctx: TestContext) => void;

type TestContext = {
  ui: {
    notify: ReturnType<typeof vi.fn>;
  };
};

function result(code: number, stdout = "", stderr = ""): CommandResult {
  return { code, stdout, stderr, killed: false };
}

function setup() {
  let tool: ToolDefinition | undefined;
  let command: CommandDefinition | undefined;
  const handlers = new Map<string, SessionHandler>();
  const exec = vi.fn();
  const sendMessage = vi.fn();

  agentCommentWatcherExtension({
    exec,
    sendMessage,
    on(eventName: string, handler: SessionHandler) {
      handlers.set(eventName, handler);
    },
    registerTool(definition: ToolDefinition) {
      tool = definition;
    },
    registerCommand(_name: string, definition: CommandDefinition) {
      command = definition;
    },
  } as never);

  if (!tool) throw new Error("watch_agent_comments was not registered.");
  if (!command) throw new Error("watch-agent-comments was not registered.");
  const ctx: TestContext = { ui: { notify: vi.fn() } };
  handlers.get("session_start")?.({}, ctx);

  return { tool, command, handlers, ctx, exec, sendMessage };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("watch_agent_comments", () => {
  it("requires explicit directories before starting", async () => {
    const { tool } = setup();

    await expect(tool.execute("call-1", { action: "start" })).rejects.toThrow(
      "directories is required when action is start",
    );
  });

  it("starts from the slash command with explicit directories", async () => {
    const { command, ctx, exec, sendMessage } = setup();
    exec.mockResolvedValueOnce(result(0, "ripgrep 14.1.0\n")).mockResolvedValueOnce(result(0, "review.md\n1:@agent Check this\n"));

    await command.handler("start .", ctx);

    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ content: "review.md\n1:@agent Check this\n" }),
      { triggerTurn: true, deliverAs: "steer" },
    );
    expect(ctx.ui.notify).toHaveBeenCalledWith(expect.stringContaining("Watching ."), "info");
  });

  it("reports pre-existing matches with the raw rg output", async () => {
    const { tool, exec, sendMessage } = setup();
    const output = "src/example.ts\n12-const context = true;\n13:@agent Please rename this.\n14-const stale = false;\n";
    exec.mockResolvedValueOnce(result(0, "ripgrep 14.1.0\n")).mockResolvedValueOnce(result(0, output));

    await tool.execute("call-2", { action: "start", directories: ["src", "tests"] });

    expect(exec).toHaveBeenNthCalledWith(1, "rg", ["--version"]);
    expect(exec).toHaveBeenNthCalledWith(2, "rg", [
      "-uu",
      "-F",
      "-n",
      "--heading",
      "-C",
      "4",
      "--sort",
      "path",
      "--glob",
      "!.git",
      "--glob",
      "!node_modules",
      "--glob",
      "!dist",
      "--glob",
      "!build",
      "--glob",
      "!.next",
      "--glob",
      "!coverage",
      "@agent",
      "src",
      "tests",
    ]);
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ content: output, customType: "agent-comment-watcher", display: true }),
      { triggerTurn: true, deliverAs: "steer" },
    );
  });

  it("does not reinject unchanged output but reports a changed result", async () => {
    const { tool, exec, sendMessage } = setup();
    exec
      .mockResolvedValueOnce(result(0, "ripgrep 14.1.0\n"))
      .mockResolvedValueOnce(result(0, "one.ts\n1:@agent First\n"))
      .mockResolvedValueOnce(result(0, "one.ts\n1:@agent First\n"))
      .mockResolvedValueOnce(result(0, "two.ts\n2:@agent Second\n"));

    await tool.execute("call-3", { action: "start", directories: ["."] });
    await vi.advanceTimersByTimeAsync(5_000);
    await vi.advanceTimersByTimeAsync(5_000);

    expect(sendMessage).toHaveBeenCalledTimes(2);
    expect(sendMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({ content: "two.ts\n2:@agent Second\n" }),
      { triggerTurn: true, deliverAs: "steer" },
    );
  });

  it("stops polling when the session shuts down", async () => {
    const { tool, handlers, ctx, exec } = setup();
    exec.mockResolvedValueOnce(result(0, "ripgrep 14.1.0\n")).mockResolvedValueOnce(result(1));

    await tool.execute("call-4", { action: "start", directories: ["."] });
    handlers.get("session_shutdown")?.({}, ctx);
    await vi.advanceTimersByTimeAsync(5_000);

    expect(exec).toHaveBeenCalledTimes(2);
  });
});
