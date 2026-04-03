import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionEntry } from "@mariozechner/pi-coding-agent";

vi.mock("node:fs/promises", () => ({
	writeFile: vi.fn(),
}));

import { writeFile } from "node:fs/promises";
import codeLastExtension from "../extensions/code-last";

beforeEach(() => {
	vi.clearAllMocks();
});

type CommandHandler = (args: string, ctx: TestContext) => Promise<void>;

type TestContext = {
	sessionManager: {
		getBranch: () => SessionEntry[];
	};
	ui: {
		notify: ReturnType<typeof vi.fn>;
	};
};

function createAssistantEntry(text: string): SessionEntry {
	return {
		type: "message",
		id: "a1",
		parentId: null,
		timestamp: new Date().toISOString(),
		message: {
			role: "assistant",
			content: [{ type: "text", text }],
			api: "x",
			provider: "x",
			model: "x",
			usage: {
				input: 0,
				output: 0,
				cacheRead: 0,
				cacheWrite: 0,
				totalTokens: 0,
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
			},
			stopReason: "stop",
			timestamp: Date.now(),
		},
	};
}

function createAssistantThinkingOnlyEntry(): SessionEntry {
	return {
		type: "message",
		id: "a-thinking",
		parentId: null,
		timestamp: new Date().toISOString(),
		message: {
			role: "assistant",
			content: [{ type: "thinking", thinking: "internal" }],
			api: "x",
			provider: "x",
			model: "x",
			usage: {
				input: 0,
				output: 0,
				cacheRead: 0,
				cacheWrite: 0,
				totalTokens: 0,
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
			},
			stopReason: "stop",
			timestamp: Date.now(),
		},
	};
}

function createUserEntry(text: string): SessionEntry {
	return {
		type: "message",
		id: "u1",
		parentId: null,
		timestamp: new Date().toISOString(),
		message: {
			role: "user",
			content: text,
			timestamp: Date.now(),
		},
	};
}

function createAbortedEmptyAssistantEntry(): SessionEntry {
	return {
		type: "message",
		id: "a-aborted",
		parentId: null,
		timestamp: new Date().toISOString(),
		message: {
			role: "assistant",
			content: [],
			api: "x",
			provider: "x",
			model: "x",
			usage: {
				input: 0,
				output: 0,
				cacheRead: 0,
				cacheWrite: 0,
				totalTokens: 0,
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
			},
			stopReason: "aborted",
			timestamp: Date.now(),
		},
	};
}

function createCustomEntry(): SessionEntry {
	return {
		type: "custom",
		id: "c1",
		parentId: null,
		timestamp: new Date().toISOString(),
		customType: "x",
		data: {},
	};
}

function setup(branch: SessionEntry[]) {
	const registered = new Map<string, { handler: CommandHandler }>();
	const exec = vi.fn();
	const pi = {
		registerCommand(name: string, def: { description?: string; handler: CommandHandler }) {
			registered.set(name, def);
		},
		exec,
	};

	codeLastExtension(pi as any);
	const command = registered.get("code-last");
	if (!command) throw new Error("Command not registered");

	const notify = vi.fn();
	const ctx: TestContext = {
		sessionManager: {
			getBranch: () => branch,
		},
		ui: { notify },
	};

	return { handler: command.handler, exec, notify, ctx };
}

describe("/code-last", () => {
	it("shows a user-facing error instead of throwing when writing the temp file fails", async () => {
		vi.mocked(writeFile).mockRejectedValueOnce(new Error("disk full"));
		const { handler, exec, notify, ctx } = setup([createAssistantEntry("Hello")]);

		await expect(handler("", ctx)).resolves.toBeUndefined();

		expect(exec).not.toHaveBeenCalled();
		expect(notify).toHaveBeenCalledWith(expect.stringContaining("Failed to write"), "error");
	});

	it("uses the same empty-history wording as /copy", async () => {
		const { handler, notify, exec, ctx } = setup([]);

		await expect(handler("", ctx)).resolves.toBeUndefined();

		expect(exec).not.toHaveBeenCalled();
		expect(notify).toHaveBeenCalledWith("No agent messages to copy yet.", "error");
	});

	it("shows stderr details when VS Code exits with non-zero status", async () => {
		vi.mocked(writeFile).mockResolvedValueOnce(undefined);
		const { handler, notify, exec, ctx } = setup([createAssistantEntry("Hello")]);
		exec.mockResolvedValueOnce({ stdout: "", stderr: "code: command not found", code: 127, killed: false });

		await expect(handler("", ctx)).resolves.toBeUndefined();

		expect(exec).toHaveBeenCalledTimes(1);
		expect(notify).toHaveBeenCalledWith(
			expect.stringContaining("Failed to open VS Code (code: command not found)"),
			"error",
		);
	});

	it("opens a timestamped markdown file in a new VS Code window when execution succeeds", async () => {
		vi.mocked(writeFile).mockResolvedValueOnce(undefined);
		const { handler, notify, exec, ctx } = setup([createAssistantEntry("Hello")]);
		exec.mockResolvedValueOnce({ stdout: "", stderr: "", code: 0, killed: false });

		await expect(handler("", ctx)).resolves.toBeUndefined();

		expect(exec).toHaveBeenCalledTimes(1);
		expect(exec).toHaveBeenCalledWith("code", ["-n", expect.stringMatching(/pi-code-last-.*\.md$/)]);
		expect(notify).toHaveBeenCalledWith(
			expect.stringMatching(/^Opened last assistant output in VS Code: .*pi-code-last-.*\.md$/),
			"info",
		);
	});

	it("shows an actionable error when invoking the code command throws", async () => {
		vi.mocked(writeFile).mockResolvedValueOnce(undefined);
		const { handler, notify, exec, ctx } = setup([createAssistantEntry("Hello")]);
		exec.mockRejectedValueOnce(new Error("spawn ENOENT"));

		await expect(handler("", ctx)).resolves.toBeUndefined();

		expect(notify).toHaveBeenCalledWith(expect.stringContaining("Failed to open VS Code."), "error");
		expect(notify).toHaveBeenCalledWith(expect.stringContaining("Shell Command: Install 'code' command in PATH"), "error");
	});

	it("skips non-assistant and aborted-empty entries when selecting the last assistant output", async () => {
		vi.mocked(writeFile).mockResolvedValueOnce(undefined);
		const { handler, exec, ctx } = setup([
			createAssistantEntry("Older answer"),
			createUserEntry("user prompt"),
			createCustomEntry(),
			createAbortedEmptyAssistantEntry(),
		]);
		exec.mockResolvedValueOnce({ stdout: "", stderr: "", code: 0, killed: false });

		await expect(handler("", ctx)).resolves.toBeUndefined();

		expect(writeFile).toHaveBeenCalledWith(expect.any(String), "Older answer", "utf8");
	});

	it("treats assistant messages without text blocks as no-copyable output", async () => {
		const { handler, notify, exec, ctx } = setup([createAssistantThinkingOnlyEntry()]);

		await expect(handler("", ctx)).resolves.toBeUndefined();

		expect(exec).not.toHaveBeenCalled();
		expect(writeFile).not.toHaveBeenCalled();
		expect(notify).toHaveBeenCalledWith("No agent messages to copy yet.", "error");
	});
});
