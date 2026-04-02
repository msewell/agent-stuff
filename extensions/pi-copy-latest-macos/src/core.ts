import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";

type ContentBlock = { type?: string; text?: string };

type AssistantMessage = {
	role?: string;
	content?: unknown;
	stopReason?: string;
};

export type SessionEntryLike = {
	type?: string;
	message?: AssistantMessage;
};

export function extractAssistantText(content: unknown): string {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";

	const parts: string[] = [];
	for (const part of content) {
		if (!part || typeof part !== "object") continue;
		const block = part as ContentBlock;
		if (block.type === "text" && typeof block.text === "string") {
			parts.push(block.text);
		}
	}

	return parts.join("");
}

function isAbortedAndEmpty(message: AssistantMessage): boolean {
	return message.stopReason === "aborted" && Array.isArray(message.content) && message.content.length === 0;
}

/**
 * Mirrors pi's "latest assistant text" behavior:
 * - scan backward for assistant messages
 * - skip aborted+empty assistant messages
 * - extract text blocks and trim outer whitespace
 */
export function getLastAssistantText(entries: SessionEntryLike[]): string | undefined {
	const assistant = entries
		.slice()
		.reverse()
		.find((entry) => {
			if (entry.type !== "message" || entry.message?.role !== "assistant") return false;
			return !isAbortedAndEmpty(entry.message);
		});

	if (!assistant?.message) return undefined;
	const text = extractAssistantText(assistant.message.content).trim();
	return text || undefined;
}

type SpawnFn = (
	command: string,
	args: readonly string[],
	options: { stdio: ["pipe", "ignore", "pipe"] },
) => ChildProcessWithoutNullStreams;

interface CopyDeps {
	platform?: NodeJS.Platform;
	spawnFn?: SpawnFn;
}

export async function copyTextToPbcopy(text: string, deps: CopyDeps = {}): Promise<void> {
	const platform = deps.platform ?? process.platform;
	if (platform !== "darwin") {
		throw new Error("This extension only supports macOS (pbcopy).");
	}

	const spawnFn = deps.spawnFn ?? (spawn as unknown as SpawnFn);

	await new Promise<void>((resolve, reject) => {
		let stderr = "";
		const child = spawnFn("pbcopy", [], { stdio: ["pipe", "ignore", "pipe"] });

		child.stderr.on("data", (chunk: Buffer | string) => {
			stderr += chunk.toString();
		});

		child.on("error", reject);
		child.on("close", (code) => {
			if (code === 0) {
				resolve();
				return;
			}
			reject(new Error(stderr.trim() || `pbcopy exited with code ${code ?? "unknown"}`));
		});

		child.stdin.end(text);
	});
}
