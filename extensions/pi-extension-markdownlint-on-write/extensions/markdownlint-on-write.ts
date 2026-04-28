import { getAgentDir, type ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

type LintMode = "error" | "warning";
type RuleConfig = Record<string, unknown>;

interface MarkdownLintConfig {
	mode?: unknown;
	rules?: unknown;
}

interface ResolvedMarkdownLintConfig {
	mode: LintMode;
	rules: RuleConfig;
}

const CONFIG_PATH = join(getAgentDir(), "markdownlint-on-write.json");
const DEFAULT_MODE: LintMode = "error";
const DEFAULT_RULES: RuleConfig = { MD013: false, MD029: false, MD060: false, MD004: false };
const MAX_REPORT_LINES = 120;
const MAX_REPORT_CHARS = 12_000;

function parseMode(value: unknown): LintMode | undefined {
	if (typeof value !== "string") return undefined;
	const normalized = value.trim().toLowerCase();
	if (normalized === "error" || normalized === "warning") return normalized;
	return undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function cloneDefaultConfig(): ResolvedMarkdownLintConfig {
	return {
		mode: DEFAULT_MODE,
		rules: { ...DEFAULT_RULES },
	};
}

function validateConfig(raw: unknown): ResolvedMarkdownLintConfig {
	if (!isObject(raw)) {
		throw new Error("Config must be a JSON object.");
	}

	const parsedMode = raw.mode === undefined ? DEFAULT_MODE : parseMode(raw.mode);
	if (!parsedMode) {
		throw new Error('"mode" must be "error" or "warning" when provided.');
	}

	let rules: RuleConfig = { ...DEFAULT_RULES };
	if (raw.rules !== undefined) {
		if (!isObject(raw.rules)) {
			throw new Error('"rules" must be an object mapping rule names to configs.');
		}
		rules = { ...raw.rules };
	}

	return {
		mode: parsedMode,
		rules,
	};
}

async function saveConfig(config: ResolvedMarkdownLintConfig): Promise<void> {
	await mkdir(dirname(CONFIG_PATH), { recursive: true });
	await writeFile(
		CONFIG_PATH,
		`${JSON.stringify({ mode: config.mode, rules: config.rules }, null, 2)}\n`,
		"utf8",
	);
}

async function loadConfig(): Promise<ResolvedMarkdownLintConfig> {
	let raw: string;
	try {
		raw = await readFile(CONFIG_PATH, "utf8");
	} catch (error: unknown) {
		if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
			const seeded = cloneDefaultConfig();
			await saveConfig(seeded);
			return seeded;
		}
		throw new Error(`Unable to read config: ${getErrorMessage(error)}`);
	}

	let parsed: MarkdownLintConfig;
	try {
		parsed = JSON.parse(raw) as MarkdownLintConfig;
	} catch (error: unknown) {
		throw new Error(`Invalid JSON: ${getErrorMessage(error)}`);
	}

	return validateConfig(parsed);
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
	const selected = lines.slice(0, MAX_REPORT_LINES);
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
	let config = cloneDefaultConfig();
	let configLoaded = false;
	let configLoadError: string | undefined;
	let configLoadErrorNotified = false;

	async function ensureConfigLoaded(ctx?: { hasUI: boolean; ui: { notify: (message: string, type: "error") => void } }) {
		if (configLoaded) return;

		try {
			config = await loadConfig();
			configLoaded = true;
			configLoadError = undefined;
			configLoadErrorNotified = false;
		} catch (error: unknown) {
			configLoadError = getErrorMessage(error);
			if (ctx?.hasUI && !configLoadErrorNotified) {
				ctx.ui.notify(
					`markdownlint config error (${CONFIG_PATH}): ${configLoadError}`,
					"error",
				);
				configLoadErrorNotified = true;
			}
		}
	}

	pi.on("session_start", async (_event, ctx) => {
		await ensureConfigLoaded(ctx);
	});

	pi.registerCommand("markdownlint-mode", {
		description: "Get or set markdownlint enforcement mode: error|warning",
		handler: async (args, ctx) => {
			await ensureConfigLoaded(ctx);

			if (configLoadError) {
				ctx.ui.notify(
					`Cannot read markdownlint config at ${CONFIG_PATH}: ${configLoadError}`,
					"error",
				);
				return;
			}

			const requestedMode = parseMode(args);
			if (!args || args.trim().length === 0) {
				ctx.ui.notify(
					`markdownlint mode: ${config.mode} (config: ${CONFIG_PATH})\nRules source: ${CONFIG_PATH}#/rules`,
					"info",
				);
				return;
			}

			if (!requestedMode) {
				ctx.ui.notify("Invalid mode. Use: /markdownlint-mode error|warning", "warning");
				return;
			}

			const nextConfig: ResolvedMarkdownLintConfig = {
				...config,
				mode: requestedMode,
			};

			try {
				await saveConfig(nextConfig);
				config = nextConfig;
				configLoaded = true;
				configLoadError = undefined;
				ctx.ui.notify(`markdownlint mode set to ${config.mode} (persisted globally)`, "success");
			} catch (error: unknown) {
				ctx.ui.notify(`Failed to save markdownlint config: ${getErrorMessage(error)}`, "error");
			}
		},
	});

	pi.on("tool_result", async (event, ctx) => {
		if (event.toolName !== "write" && event.toolName !== "edit") return undefined;
		if (event.isError) return undefined;

		const toolPath = getPathFromToolInput(event.input);
		if (!toolPath) return undefined;

		const absolutePath = resolve(ctx.cwd, toolPath);
		if (!absolutePath.endsWith(".md")) return undefined;

		await ensureConfigLoaded(ctx);

		if (configLoadError) {
			const report =
				`markdownlint config is invalid at ${CONFIG_PATH}.\n` +
				`Failing fast before linting ${absolutePath}.\n` +
				`Fix the config file and retry.\n\n` +
				configLoadError;
			return {
				content: [...event.content, { type: "text", text: report } as const],
				isError: true,
			};
		}

		let lintOutput = "";
		let lintFailed = false;

		try {
			const result = await pi.exec(
				"markdownlint-cli2",
				[
					absolutePath,
					"--config",
					CONFIG_PATH,
					"--configPointer",
					"/rules",
				],
				{
					signal: ctx.signal,
					timeout: 20_000,
				},
			);

			lintFailed = result.code !== 0;
			lintOutput = `${result.stdout ?? ""}${result.stderr ? `\n${result.stderr}` : ""}`.trim();
		} catch (error: unknown) {
			lintFailed = true;
			lintOutput = error instanceof Error ? error.message : String(error);
		}

		if (!lintFailed) return undefined;

		const truncated = truncateLintOutput(lintOutput);
		const header =
			config.mode === "error"
				? `markdownlint-cli2 failed for ${absolutePath} (mode=error).`
				: `markdownlint-cli2 found issues in ${absolutePath} (mode=warning).`;
		const guidance =
			config.mode === "error"
				? "Fix markdownlint issues before considering this change complete."
				: "This is a warning only. Fix markdownlint issues when you can.";

		const report = `${header}\n${guidance}\nConfig: ${CONFIG_PATH}#/rules (local .markdownlint* files can override)\n\n${truncated}`;
		const nextContent = [...event.content, { type: "text", text: report } as const];

		return {
			content: nextContent,
			isError: config.mode === "error" ? true : event.isError,
		};
	});
}
