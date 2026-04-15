import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import { printDiagnostics, type Diagnostic } from "./validation-common.js";

interface Frontmatter {
  name?: string;
  description?: string;
  [key: string]: string | undefined;
}

function toPosixPath(path: string): string {
  return path.replace(/\\/g, "/");
}

function relativePath(baseDir: string, absolutePath: string): string {
  const base = toPosixPath(resolve(baseDir));
  const abs = toPosixPath(resolve(absolutePath));
  if (abs.startsWith(`${base}/`)) {
    return abs.slice(base.length + 1);
  }
  return abs;
}

function parseFrontmatter(content: string, file: string): { frontmatter: Frontmatter | null; body: string; diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];
  const lines = content.split("\n");

  if (lines[0]?.trim() !== "---") {
    diagnostics.push({
      file,
      severity: "error",
      check: "frontmatter",
      message: "Missing opening frontmatter delimiter '---' on line 1.",
      line: 1,
    });
    return { frontmatter: null, body: content, diagnostics };
  }

  let closingIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === "---") {
      closingIndex = i;
      break;
    }
  }

  if (closingIndex < 0) {
    diagnostics.push({
      file,
      severity: "error",
      check: "frontmatter",
      message: "Missing closing frontmatter delimiter '---'.",
      line: 1,
    });
    return { frontmatter: null, body: content, diagnostics };
  }

  const block = lines.slice(1, closingIndex);
  const fm: Frontmatter = {};

  for (let i = 0; i < block.length; i++) {
    const raw = block[i]?.trim();
    if (!raw || raw.startsWith("#")) continue;
    const colon = raw.indexOf(":");
    if (colon <= 0) {
      diagnostics.push({
        file,
        severity: "error",
        check: "frontmatter",
        message: `Invalid frontmatter line: '${raw}'`,
        line: i + 2,
      });
      continue;
    }

    const key = raw.slice(0, colon).trim();
    let value = raw.slice(colon + 1).trim();
    value = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    fm[key] = value;
  }

  const body = lines.slice(closingIndex + 1).join("\n");
  return { frontmatter: fm, body, diagnostics };
}

function parseMarkdownLinks(content: string): Array<{ target: string; index: number }> {
  const links: Array<{ target: string; index: number }> = [];
  const re = /\[[^\]]+\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    links.push({ target: match[1]!, index: match.index });
  }
  return links;
}

function computeLineFromOffset(content: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < content.length && i < offset; i++) {
    if (content[i] === "\n") line++;
  }
  return line;
}

function validateSkill(skillDirInput: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const skillDir = resolve(skillDirInput);
  const skillName = basename(skillDir);

  if (!statSync(skillDir).isDirectory()) {
    diagnostics.push({
      file: skillDir,
      severity: "error",
      check: "layout",
      message: "Skill path must be a directory.",
    });
    return diagnostics;
  }

  const skillFile = resolve(skillDir, "SKILL.md");
  let skillContent = "";

  try {
    skillContent = readFileSync(skillFile, "utf-8");
  } catch {
    diagnostics.push({
      file: relativePath(skillDir, skillFile),
      severity: "error",
      check: "layout",
      message: "Missing SKILL.md.",
    });
    return diagnostics;
  }

  const { frontmatter, body, diagnostics: frontmatterDiagnostics } = parseFrontmatter(
    skillContent,
    relativePath(skillDir, skillFile),
  );
  diagnostics.push(...frontmatterDiagnostics);

  if (frontmatter) {
    const name = frontmatter.name;
    const description = frontmatter.description;

    if (!name) {
      diagnostics.push({
        file: "SKILL.md",
        severity: "error",
        check: "name",
        message: "Frontmatter field 'name' is required.",
      });
    } else {
      if (name.length < 1 || name.length > 64) {
        diagnostics.push({
          file: "SKILL.md",
          severity: "error",
          check: "name",
          message: "'name' must be 1-64 characters.",
        });
      }
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
        diagnostics.push({
          file: "SKILL.md",
          severity: "error",
          check: "name",
          message: "'name' must be lowercase kebab-case.",
        });
      }
      if (name !== skillName) {
        diagnostics.push({
          file: "SKILL.md",
          severity: "error",
          check: "name",
          message: `'name' (${name}) must match directory name (${skillName}).`,
        });
      }
    }

    if (!description) {
      diagnostics.push({
        file: "SKILL.md",
        severity: "error",
        check: "description",
        message: "Frontmatter field 'description' is required.",
      });
    } else {
      if (description.length < 1 || description.length > 1024) {
        diagnostics.push({
          file: "SKILL.md",
          severity: "error",
          check: "description",
          message: "'description' must be 1-1024 characters.",
        });
      }

      if (!/\bUse when\b/.test(description)) {
        diagnostics.push({
          file: "SKILL.md",
          severity: "warning",
          check: "description",
          message: "Description should include 'Use when' for trigger clarity.",
        });
      }

      if (/\b(I|we|you|your|our)\b/i.test(description)) {
        diagnostics.push({
          file: "SKILL.md",
          severity: "warning",
          check: "description-pov",
          message: "Description appears to use first/second-person language; prefer third person.",
        });
      }
    }
  }

  const bodyLines = body.split("\n").length;
  if (bodyLines >= 500) {
    diagnostics.push({
      file: "SKILL.md",
      severity: "error",
      check: "size",
      message: `SKILL.md body has ${bodyLines} lines; must be < 500.`,
    });
  }

  const referencesDir = resolve(skillDir, "references");
  let referenceFileNames: string[] = [];
  let hasReferencesDir = true;

  try {
    referenceFileNames = readdirSync(referencesDir)
      .filter((f) => extname(f) === ".md")
      .sort((a, b) => a.localeCompare(b));
  } catch {
    hasReferencesDir = false;
  }

  const skillLinks = parseMarkdownLinks(skillContent);
  const skillRefTargets = new Set<string>();
  for (const link of skillLinks) {
    if (link.target.includes("\\")) {
      diagnostics.push({
        file: "SKILL.md",
        severity: "error",
        check: "paths",
        message: `Windows-style path separator in link target '${link.target}'.`,
        line: computeLineFromOffset(skillContent, link.index),
      });
    }
    if (/^references\/.+\.md$/i.test(link.target)) {
      skillRefTargets.add(link.target);
    }
  }

  if (!hasReferencesDir) {
    if (skillRefTargets.size > 0) {
      diagnostics.push({
        file: "SKILL.md",
        severity: "error",
        check: "reference-linking",
        message: "SKILL.md links to references/*.md but references/ directory is missing.",
      });
    }
  } else {
    if (referenceFileNames.length === 0) {
      diagnostics.push({
        file: "references",
        severity: "error",
        check: "layout",
        message: "No reference .md files found in references/.",
      });
    }

    const seenNums = new Set<number>();
    for (const fileName of referenceFileNames) {
      const match = /^(\d{2})-([a-z0-9][a-z0-9-]*)\.md$/.exec(fileName);
      if (!match) {
        diagnostics.push({
          file: `references/${fileName}`,
          severity: "error",
          check: "reference-name",
          message: "Reference filename must match 'NN-kebab-case.md'.",
        });
        continue;
      }
      const n = Number.parseInt(match[1]!, 10);
      if (seenNums.has(n)) {
        diagnostics.push({
          file: `references/${fileName}`,
          severity: "error",
          check: "reference-numbering",
          message: `Duplicate reference number ${match[1]}.`,
        });
      }
      seenNums.add(n);
    }

    if (seenNums.size > 0) {
      const max = Math.max(...Array.from(seenNums));
      for (let n = 1; n <= max; n++) {
        if (!seenNums.has(n)) {
          const expected = String(n).padStart(2, "0");
          diagnostics.push({
            file: "references",
            severity: "error",
            check: "reference-numbering",
            message: `Missing reference file number ${expected}.`,
          });
        }
      }
    }

    for (const fileName of referenceFileNames) {
      const refRel = `references/${fileName}`;
      if (!skillRefTargets.has(refRel)) {
        diagnostics.push({
          file: "SKILL.md",
          severity: "error",
          check: "reference-linking",
          message: `Missing link to ${refRel} from SKILL.md.`,
        });
      }

      const refPath = resolve(referencesDir, fileName);
      const refContent = readFileSync(refPath, "utf-8");
      const refLines = refContent.split("\n");
      const refDisplay = `references/${fileName}`;

      if (refLines.length > 300) {
        diagnostics.push({
          file: refDisplay,
          severity: "error",
          check: "reference-size",
          message: `Reference has ${refLines.length} lines; must be <= 300.`,
        });
      }

      if (refLines.length > 100 && !refLines.some((line) => line.trim() === "## Table of Contents")) {
        diagnostics.push({
          file: refDisplay,
          severity: "error",
          check: "reference-toc",
          message: "Reference files over 100 lines must include '## Table of Contents'.",
        });
      }

      const refLinks = parseMarkdownLinks(refContent);
      for (const link of refLinks) {
        if (link.target.includes("\\")) {
          diagnostics.push({
            file: refDisplay,
            severity: "error",
            check: "paths",
            message: `Windows-style path separator in link target '${link.target}'.`,
            line: computeLineFromOffset(refContent, link.index),
          });
        }
        if (/^references\/.+\.md$/i.test(link.target)) {
          diagnostics.push({
            file: refDisplay,
            severity: "error",
            check: "nested-references",
            message: `Nested reference link '${link.target}' is not allowed. Link from SKILL.md instead.`,
            line: computeLineFromOffset(refContent, link.index),
          });
        }
      }

    }
  }

  const forbidden = new Set([
    "README.md",
    "CHANGELOG.md",
    "INSTALLATION_GUIDE.md",
    "QUICK_REFERENCE.md",
  ]);

  const stack = [skillDir];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) continue;

    for (const entry of readdirSync(dir)) {
      const fullPath = resolve(dir, entry);
      const st = statSync(fullPath);
      if (st.isDirectory()) {
        stack.push(fullPath);
      } else if (forbidden.has(entry)) {
        diagnostics.push({
          file: relativePath(skillDir, fullPath),
          severity: "error",
          check: "forbidden-files",
          message: `Forbidden file '${entry}' found inside skill directory.`,
        });
      }
    }
  }

  return diagnostics;
}

function main(): void {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage: tsx validate-skill.ts <skill-directory>");
    process.exit(2);
  }

  let diagnostics: Diagnostic[] = [];
  try {
    diagnostics = validateSkill(arg);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\x1b[31mERR\x1b[0m  validator  [runtime] ${message}`);
    process.exit(1);
  }

  const { errors } = printDiagnostics(diagnostics, "Skill passed all checks.");
  process.exit(errors > 0 ? 1 : 0);
}

main();
