import type { ExtensionAPI, ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { copyTextToPbcopy, getLastAssistantText, type SessionEntryLike } from "../src/core.js";

async function copyLatestAssistantOutput(ctx: ExtensionCommandContext): Promise<void> {
	const entries = ctx.sessionManager.getBranch() as SessionEntryLike[];
	const text = getLastAssistantText(entries);
	if (!text) return;

	try {
		await copyTextToPbcopy(text);
	} catch (error) {
		if (ctx.hasUI) {
			const message = error instanceof Error ? error.message : "Unknown error";
			ctx.ui.notify(`Failed to copy via pbcopy: ${message}`, "error");
		}
	}
}

export default function copyLatestMacosExtension(pi: ExtensionAPI) {
	pi.registerCommand("copy", {
		description: "Copy latest assistant output to macOS clipboard",
		handler: async (_args, ctx) => {
			await copyLatestAssistantOutput(ctx);
		},
	});
}
