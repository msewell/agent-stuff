import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface StagedEntry {
  status: string;
  oldPath?: string;
  newPath?: string;
}

function parseNameStatusZ(output: string): StagedEntry[] {
  if (!output) return [];

  const tokens = output.split("\0");
  if (tokens[tokens.length - 1] === "") tokens.pop();

  const entries: StagedEntry[] = [];
  let i = 0;

  while (i < tokens.length) {
    const status = tokens[i++];
    if (!status) break;

    if (status.startsWith("R") || status.startsWith("C")) {
      const oldPath = tokens[i++];
      const newPath = tokens[i++];
      entries.push({ status, oldPath, newPath });
    } else {
      const newPath = tokens[i++];
      entries.push({ status, newPath });
    }
  }

  return entries;
}

function runOrFail(command: string, args: string[], cwd: string): void {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });

  if (result.error) {
    console.error(`Failed to run '${command}': ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const tsxBin = resolve(scriptDir, "node_modules", ".bin", "tsx");
const markdownlintBin = resolve(scriptDir, "node_modules", ".bin", "markdownlint-cli2");

if (!existsSync(tsxBin) || !existsSync(markdownlintBin)) {
  console.error("Missing .scripts/node_modules binaries. Run: (cd .scripts && npm install)");
  process.exit(2);
}

let raw = "";
try {
  raw = execFileSync(
    "git",
    ["diff", "--cached", "--name-status", "-z", "--diff-filter=ACMRD"],
    { cwd: repoRoot, encoding: "utf8" },
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to list staged files: ${message}`);
  process.exit(2);
}

const staged = parseNameStatusZ(raw);

const touchedSkillDirs = new Set<string>();
const touchedPromptFiles = new Set<string>();

function addSkillDirFromPath(path: string): void {
  const match = /^skills\/([^/]+)\//.exec(path);
  if (!match) return;
  touchedSkillDirs.add(`skills/${match[1]}`);
}

for (const entry of staged) {
  if (entry.oldPath) addSkillDirFromPath(entry.oldPath);
  if (entry.newPath) addSkillDirFromPath(entry.newPath);

  // Only validate prompt files that still exist in working tree.
  if (entry.newPath && /^prompts\/.*\.md$/i.test(entry.newPath)) {
    const abs = resolve(repoRoot, entry.newPath);
    if (existsSync(abs)) touchedPromptFiles.add(entry.newPath);
  }
}

const sortedSkills = Array.from(touchedSkillDirs).sort();
const sortedPrompts = Array.from(touchedPromptFiles).sort();

if (sortedSkills.length === 0 && sortedPrompts.length === 0) {
  console.log("No staged skill/prompt changes to validate.");
  process.exit(0);
}

if (sortedSkills.length > 0) {
  console.log(`Validating ${sortedSkills.length} changed skill(s)...`);

  for (const relSkillDir of sortedSkills) {
    const absSkillDir = resolve(repoRoot, relSkillDir);

    // If skill was fully deleted, there is nothing left to validate.
    if (!existsSync(absSkillDir)) {
      console.log(`- Skipping deleted skill directory: ${relSkillDir}`);
      continue;
    }

    console.log(`- ${relSkillDir}`);
    runOrFail(tsxBin, ["validate-skill.ts", absSkillDir], scriptDir);
  }
}

if (sortedPrompts.length > 0) {
  console.log(`Validating ${sortedPrompts.length} changed prompt file(s)...`);

  const promptArgs = sortedPrompts.map((p) => resolve(repoRoot, p));
  runOrFail(tsxBin, ["validate-prompt.ts", ...promptArgs], scriptDir);

  const markdownlintArgs = [
    ...sortedPrompts.map((p) => `../${p}`),
    "--config",
    "../.markdownlint.jsonc",
  ];
  runOrFail(markdownlintBin, markdownlintArgs, scriptDir);
}

console.log("Validation passed for staged changes.");
