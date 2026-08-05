import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { StringEnum } from "@earendil-works/pi-ai";
import { Type, type Static } from "typebox";

const MARKER = "@agent";
const CONTEXT_LINES = 4;
const INTERVAL_MS = 5_000;
const EXCLUDED_DIRECTORIES = [".git", "node_modules", "dist", "build", ".next", "coverage"];

const watchAgentCommentsParameters = Type.Object({
  action: StringEnum(["start", "stop", "status"] as const, {
    description: "Start, stop, or report the status of the session-scoped watcher.",
  }),
  directories: Type.Optional(
    Type.Array(Type.String({ minLength: 1 }), {
      minItems: 1,
      description: "Directory trees to watch. Required when action is start; every watched path must be explicit.",
    }),
  ),
});

type WatchAgentCommentsParameters = Static<typeof watchAgentCommentsParameters>;

type CommandResult = {
  stdout: string;
  stderr: string;
  code: number | null;
  killed: boolean;
};

type WatcherContext = {
  ui: {
    notify(message: string, level: "info" | "warning" | "error"): void;
  };
};

type WatchDetails = {
  stopped?: boolean;
  directories?: string[];
  marker?: string;
  intervalMs?: number;
};

function rgArguments(directories: string[]): string[] {
  return [
    "-uu",
    "-F",
    "-n",
    "--heading",
    "-C",
    String(CONTEXT_LINES),
    "--sort",
    "path",
    ...EXCLUDED_DIRECTORIES.flatMap((directory) => ["--glob", `!${directory}`]),
    MARKER,
    ...directories,
  ];
}

function commandFailure(result: CommandResult): string {
  return result.stderr.trim() || result.stdout.trim() || `exit code ${result.code ?? "unknown"}`;
}

function parseCommand(args: string): { action: "start" | "stop" | "status"; directories: string[] } | undefined {
  const [action, ...directories] = args.trim().split(/\s+/).filter(Boolean);
  if (action === "start" || action === "stop" || action === "status") {
    return { action, directories };
  }
  return undefined;
}

const COMMAND_USAGE = "Usage: /watch-agent-comments <start DIRECTORY... | stop | status>";

class AgentCommentWatcher {
  private directories: string[] | undefined;
  private interval: ReturnType<typeof setInterval> | undefined;
  private lastOutput = "";
  private scanning = false;

  constructor(
    private readonly pi: ExtensionAPI,
    private readonly ctx: WatcherContext,
  ) {}

  async start(directories: string[]): Promise<void> {
    this.stop();

    const version = (await this.pi.exec("rg", ["--version"])) as CommandResult;
    if (version.code !== 0) {
      throw new Error(`rg (ripgrep) is required: ${commandFailure(version)}`);
    }

    this.directories = directories;
    await this.scan();
    this.interval = setInterval(() => {
      void this.scan();
    }, INTERVAL_MS);
  }

  stop(): boolean {
    if (!this.interval) return false;
    clearInterval(this.interval);
    this.interval = undefined;
    this.directories = undefined;
    this.lastOutput = "";
    return true;
  }

  status(): string {
    if (!this.directories) return "The agent-comment watcher is stopped.";
    return `Watching ${this.directories.join(", ")} every ${INTERVAL_MS / 1_000}s for ${MARKER}.`;
  }

  private async scan(): Promise<void> {
    if (!this.directories || this.scanning) return;
    this.scanning = true;

    try {
      const result = (await this.pi.exec("rg", rgArguments(this.directories))) as CommandResult;
      if (result.code !== 0 && result.code !== 1) {
        this.ctx.ui.notify(`agent-comment watcher: rg failed: ${commandFailure(result)}`, "warning");
        return;
      }

      const output = result.code === 0 ? result.stdout : "";
      if (!output || output === this.lastOutput) {
        this.lastOutput = output;
        return;
      }

      this.lastOutput = output;
      this.pi.sendMessage(
        {
          customType: "agent-comment-watcher",
          content: output,
          display: true,
          details: { directories: this.directories, marker: MARKER, contextLines: CONTEXT_LINES },
        },
        { triggerTurn: true, deliverAs: "steer" },
      );
    } catch (error) {
      this.ctx.ui.notify(
        `agent-comment watcher: ${error instanceof Error ? error.message : String(error)}`,
        "warning",
      );
    } finally {
      this.scanning = false;
    }
  }
}

export default function agentCommentWatcherExtension(pi: ExtensionAPI) {
  let watcher: AgentCommentWatcher | undefined;

  pi.on("session_start", (_event, ctx) => {
    watcher = new AgentCommentWatcher(pi, ctx);
  });

  pi.on("session_shutdown", () => {
    watcher?.stop();
    watcher = undefined;
  });

  pi.registerCommand("watch-agent-comments", {
    description: "Start, stop, or inspect the @agent comment watcher",
    async handler(args, ctx) {
      if (!watcher) {
        ctx.ui.notify("agent-comment watcher is not initialized for this session.", "error");
        return;
      }

      const command = parseCommand(args);
      if (!command || (command.action === "start" && command.directories.length === 0)) {
        ctx.ui.notify(COMMAND_USAGE, "error");
        return;
      }
      if (command.action !== "start" && command.directories.length > 0) {
        ctx.ui.notify(COMMAND_USAGE, "error");
        return;
      }

      try {
        if (command.action === "start") {
          await watcher.start(command.directories);
        } else if (command.action === "stop") {
          watcher.stop();
        }
        ctx.ui.notify(watcher.status(), "info");
      } catch (error) {
        ctx.ui.notify(
          `agent-comment watcher: ${error instanceof Error ? error.message : String(error)}`,
          "error",
        );
      }
    },
  });

  pi.registerTool({
    name: "watch_agent_comments",
    label: "Watch Agent Comments",
    description:
      "Start, stop, or inspect a session-scoped watcher for literal @agent review comments. Starting requires explicitly supplied directory trees. Matching output is injected into the Pi session immediately.",
    promptSnippet: "Watch explicitly named directory trees for @agent review comments",
    promptGuidelines: [
      "Use watch_agent_comments only when the user asks to monitor explicitly named directories for @agent review comments.",
    ],
    parameters: watchAgentCommentsParameters,
    async execute(_toolCallId, params: WatchAgentCommentsParameters): Promise<{
      content: Array<{ type: "text"; text: string }>;
      details: WatchDetails;
    }> {
      if (!watcher) throw new Error("The agent-comment watcher is not initialized for this session.");

      if (params.action === "status") {
        return { content: [{ type: "text", text: watcher.status() }], details: {} };
      }

      if (params.action === "stop") {
        const stopped = watcher.stop();
        return {
          content: [{ type: "text", text: stopped ? "Stopped the agent-comment watcher." : watcher.status() }],
          details: { stopped },
        };
      }

      if (!params.directories) {
        throw new Error("directories is required when action is start.");
      }

      await watcher.start(params.directories);
      return {
        content: [{ type: "text", text: watcher.status() }],
        details: { directories: params.directories, marker: MARKER, intervalMs: INTERVAL_MS },
      };
    },
  });
}
