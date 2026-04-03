import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI, SessionEntry } from "@mariozechner/pi-coding-agent";

function getLastAssistantTextFromBranch(branch: SessionEntry[]): string | undefined {
	const lastAssistantEntry = branch
		.slice()
		.reverse()
		.find((entry) => {
			if (entry.type !== "message") return false;
			const msg = entry.message;
			if (msg.role !== "assistant") return false;
			if (msg.stopReason === "aborted" && msg.content.length === 0) return false;
			return true;
		});

	if (!lastAssistantEntry || lastAssistantEntry.type !== "message" || lastAssistantEntry.message.role !== "assistant") {
		return undefined;
	}

	let text = "";
	for (const content of lastAssistantEntry.message.content) {
		if (content.type === "text") {
			text += content.text;
		}
	}

	return text.trim() || undefined;
}

export default function (pi: ExtensionAPI) {
	pi.registerCommand("code-last", {
		description: "Open last assistant message in VS Code",
		handler: async (_args, ctx) => {
			const text = getLastAssistantTextFromBranch(ctx.sessionManager.getBranch());
			if (!text) {
				ctx.ui.notify("No agent messages to copy yet.", "error");
				return;
			}

			const timestamp = new Date().toISOString().replace(/[.:]/g, "-");
			const filePath = join(tmpdir(), `pi-code-last-${timestamp}.md`);
			try {
				await writeFile(filePath, text, "utf8");
			} catch (error) {
				ctx.ui.notify(
					`Failed to write temp file (${error instanceof Error ? error.message : String(error)})`,
					"error",
				);
				return;
			}

			try {
				const result = await pi.exec("code", ["-n", filePath]);
				if (result.code !== 0) {
					const detail = result.stderr.trim() || result.stdout.trim() || `exit code ${result.code}`;
					ctx.ui.notify(
						`Failed to open VS Code (${detail}). In VS Code, run: Shell Command: Install 'code' command in PATH`,
						"error",
					);
					return;
				}
			} catch (error) {
				ctx.ui.notify(
					`Failed to open VS Code. In VS Code, run: Shell Command: Install 'code' command in PATH (${error instanceof Error ? error.message : String(error)})`,
					"error",
				);
				return;
			}

			ctx.ui.notify(`Opened last assistant output in VS Code: ${filePath}`, "info");
		},
	});
}
