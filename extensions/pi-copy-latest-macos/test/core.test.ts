import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import test from "node:test";

import { copyTextToPbcopy, extractAssistantText, getLastAssistantText, type SessionEntryLike } from "../src/core.js";

function makeSessionEntries(entries: SessionEntryLike[]): SessionEntryLike[] {
	return entries;
}

test("extractAssistantText returns string content unchanged", () => {
	assert.equal(extractAssistantText("hello"), "hello");
});

test("extractAssistantText keeps only text blocks from content arrays", () => {
	const content = [
		{ type: "text", text: "hello" },
		{ type: "image", source: "ignored" },
		{ type: "text", text: " world" },
	] as const;
	assert.equal(extractAssistantText(content), "hello world");
});

test("getLastAssistantText returns the latest assistant text", () => {
	const entries = makeSessionEntries([
		{ type: "message", message: { role: "assistant", content: [{ type: "text", text: "old" }] } },
		{ type: "message", message: { role: "assistant", content: [{ type: "text", text: "new" }] } },
	]);

	assert.equal(getLastAssistantText(entries), "new");
});

test("getLastAssistantText skips aborted empty assistant messages", () => {
	const entries = makeSessionEntries([
		{ type: "message", message: { role: "assistant", content: [{ type: "text", text: "kept" }] } },
		{ type: "message", message: { role: "assistant", stopReason: "aborted", content: [] } },
	]);

	assert.equal(getLastAssistantText(entries), "kept");
});

test("getLastAssistantText returns undefined when latest valid assistant has no text", () => {
	const entries = makeSessionEntries([
		{ type: "message", message: { role: "assistant", content: [{ type: "text", text: "older" }] } },
		{ type: "message", message: { role: "assistant", content: [{ type: "image", source: "x" }] } },
	]);

	assert.equal(getLastAssistantText(entries), undefined);
});

test("copyTextToPbcopy rejects on non-macOS platforms", async () => {
	await assert.rejects(() => copyTextToPbcopy("x", { platform: "linux" }), /only supports macOS/i);
});

test("copyTextToPbcopy sends text to pbcopy", async () => {
	let captured = "";
	let command = "";

	const spawnFn = ((cmd: string) => {
		command = cmd;
		const child = new EventEmitter() as EventEmitter & {
			stdin: PassThrough;
			stderr: PassThrough;
		};
		child.stdin = new PassThrough();
		child.stderr = new PassThrough();

		child.stdin.on("data", (chunk: Buffer) => {
			captured += chunk.toString();
		});
		child.stdin.on("finish", () => {
			setImmediate(() => child.emit("close", 0));
		});

		return child as unknown as ReturnType<NonNullable<Parameters<typeof copyTextToPbcopy>[1]>["spawnFn"]>;
	}) as NonNullable<Parameters<typeof copyTextToPbcopy>[1]>["spawnFn"];

	await copyTextToPbcopy("hello", { platform: "darwin", spawnFn });
	assert.equal(command, "pbcopy");
	assert.equal(captured, "hello");
});

test("copyTextToPbcopy throws when pbcopy exits non-zero", async () => {
	const spawnFn = (() => {
		const child = new EventEmitter() as EventEmitter & {
			stdin: PassThrough;
			stderr: PassThrough;
		};
		child.stdin = new PassThrough();
		child.stderr = new PassThrough();

		child.stdin.on("finish", () => {
			child.stderr.emit("data", Buffer.from("pbcopy failed"));
			setImmediate(() => child.emit("close", 1));
		});

		return child as unknown as ReturnType<NonNullable<Parameters<typeof copyTextToPbcopy>[1]>["spawnFn"]>;
	}) as NonNullable<Parameters<typeof copyTextToPbcopy>[1]>["spawnFn"];

	await assert.rejects(() => copyTextToPbcopy("hello", { platform: "darwin", spawnFn }), /pbcopy failed/);
});
