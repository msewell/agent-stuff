import { getAgentDir, type ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

type LintMode = "error" | "warning";

interface MarkdownLintConfig {
	mode?: LintMode;
}

const CONFIG_PATH = join(getAgentDir(), "markdownlint-on-write.json");
const DEFAULT_MODE: LintMode = "error";
const MAX_REPORT_LINES = 120;
const MAX_REPORT_CHARS = 12_000;

function parseMode(value: string | undefined): LintMode | undefined {
	if (value === "error" || value === "warning") return value;
	return undefined;
}

async function loadMode(): Promise<LintMode> {
	try {
		const raw = await readFile(CONFIG_PATH, "utf8");
		const data = JSON.parse(raw) as MarkdownLintConfig;
		return data.mode === "warning" ? "warning" : "error";
	} catch {
		return DEFAULT_MODE;
	}
}

async function saveMode(mode: LintMode): Promise<void> {
	await mkdir(dirname(CONFIG_PATH), { recursive: true });
	await writeFile(CONFIG_PATH, `${JSON.stringify({ mode }, null, 2)}\n`, "utf8");
}

function getPathFromToolInput(input: unknown): string | undefined {
	if (!input || typeof input !== "object") return undefined;
	const value = (input as { path?: unknown }).path;
	if (typeof value !== "string") return undefined;
	return value.startsWith("@") ? value.slice(1) : value;
}

function truncateLintOutput(output: string): string {
	const trimmed = output.trim();
	if (!trimmed) return "(no markdownlint output)";

	const lines = trimmed.split("\n");
	let selected = lines.slice(0, MAX_REPORT_LINES);
	let text = selected.join("\n");

	if (text.length > MAX_REPORT_CHARS) {
		text = text.slice(0, MAX_REPORT_CHARS);
		const lastNewline = text.lastIndexOf("\n");
		if (lastNewline > 0) {
			text = text.slice(0, lastNewline);
		}
	}

	const shownLineCount = text.length === 0 ? 0 : text.split("\n").length;
	const omittedLines = Math.max(0, lines.length - shownLineCount);
	const wasCharTruncated = text.length < trimmed.length;

	if (omittedLines > 0 || wasCharTruncated) {
		text += `\n\n[markdownlint output truncated: showing ${shownLineCount}/${lines.length} lines]`;
	}

	return text;
}

export default function markdownlintOnWriteExtension(pi: ExtensionAPI) {
	let mode: LintMode = DEFAULT_MODE;
	let modeLoaded = false;

	async function ensureModeLoaded() {
		if (modeLoaded) return;
		mode = await loadMode();
		modeLoaded = true;
	}

	pi.on("session_start", async () => {
		await ensureModeLoaded();
	});

	pi.registerCommand("markdownlint-mode", {
		description: "Get or set markdownlint enforcement mode: error|warning",
		handler: async (args, ctx) => {
			await ensureModeLoaded();

			const requestedMode = parseMode(args?.trim().toLowerCase());
			if (!args || args.trim().length === 0) {
				ctx.ui.notify(
					`markdownlint mode: ${mode} (config: ${CONFIG_PATH})\nUse /markdownlint-mode error or /markdownlint-mode warning`,
					"info",
				);
				return;
			}

			if (!requestedMode) {
				ctx.ui.notify("Invalid mode. Use: /markdownlint-mode error|warning", "warning");
				return;
			}

			mode = requestedMode;
			await saveMode(mode);
			ctx.ui.notify(`markdownlint mode set to ${mode} (persisted globally)`, "success");
		},
	});

	pi.on("tool_result", async (event, ctx) => {
		if (event.toolName !== "write" && event.toolName !== "edit") return undefined;
		if (event.isError) return undefined;

		await ensureModeLoaded();

		const toolPath = getPathFromToolInput(event.input);
		if (!toolPath) return undefined;

		const absolutePath = resolve(ctx.cwd, toolPath);
		if (!absolutePath.endsWith(".md")) return undefined;

		let lintOutput = "";
		let lintFailed = false;

		try {
			const result = await pi.exec("markdownlint-cli2", [absolutePath], {
				signal: ctx.signal,
				timeout: 20_000,
			});

			lintFailed = result.code !== 0;
			lintOutput = `${result.stdout ?? ""}${result.stderr ? `\n${result.stderr}` : ""}`.trim();
		} catch (error: unknown) {
			lintFailed = true;
			lintOutput = error instanceof Error ? error.message : String(error);
		}

		if (!lintFailed) return undefined;

		const truncated = truncateLintOutput(lintOutput);
		const header =
			mode === "error"
				? `markdownlint-cli2 failed for ${absolutePath} (mode=error).`
				: `markdownlint-cli2 found issues in ${absolutePath} (mode=warning).`;
		const guidance =
			mode === "error"
				? "Fix markdownlint issues before considering this change complete."
				: "This is a warning only. Fix markdownlint issues when you can.";

		const report = `${header}\n${guidance}\n\n${truncated}`;
		const nextContent = [...event.content, { type: "text", text: report } as const];

		return {
			content: nextContent,
			isError: mode === "error" ? true : event.isError,
		};
	});
}
