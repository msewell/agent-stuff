import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import yaml from "js-yaml";
import _Ajv from "ajv";
import { printDiagnostics, type Diagnostic } from "./validation-common.js";

const Ajv = _Ajv as unknown as typeof _Ajv.default;

// ── Types ──────────────────────────────────────────────────────────────────

interface Frontmatter {
  description?: string;
  [key: string]: unknown;
}

// ── YAML Frontmatter ───────────────────────────────────────────────────────

const frontmatterSchema = {
  type: "object",
  properties: {
    description: { type: "string", minLength: 1 },
  },
  required: ["description"],
  additionalProperties: true, // allow future fields
} as const;

const ajv = new Ajv({ allErrors: true });
const validateSchema = ajv.compile<Frontmatter>(frontmatterSchema);

function extractFrontmatter(
  content: string,
  file: string,
): { frontmatter: Frontmatter | null; bodyStartLine: number; diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];
  const lines = content.split("\n");

  if (lines[0]?.trim() !== "---") {
    diagnostics.push({
      file,
      check: "frontmatter",
      severity: "error",
      message: "Missing opening frontmatter delimiter '---' on line 1.",
      line: 1,
    });
    return { frontmatter: null, bodyStartLine: 1, diagnostics };
  }

  let closeIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === "---") {
      closeIndex = i;
      break;
    }
  }

  if (closeIndex === -1) {
    diagnostics.push({
      file,
      check: "frontmatter",
      severity: "error",
      message: "Missing closing frontmatter delimiter '---'.",
      line: 1,
    });
    return { frontmatter: null, bodyStartLine: 1, diagnostics };
  }

  const yamlBlock = lines.slice(1, closeIndex).join("\n");

  let parsed: unknown;
  try {
    parsed = yaml.load(yamlBlock);
  } catch (e) {
    const yamlError = e as yaml.YAMLException;
    diagnostics.push({
      file,
      check: "frontmatter",
      severity: "error",
      message: `Invalid YAML: ${yamlError.message}`,
      line: yamlError.mark ? yamlError.mark.line + 2 : 2, // offset for delimiter
    });
    return { frontmatter: null, bodyStartLine: closeIndex + 2, diagnostics };
  }

  const fm = (parsed ?? {}) as Frontmatter;

  if (!validateSchema(fm)) {
    for (const err of validateSchema.errors ?? []) {
      diagnostics.push({
        file,
        check: "frontmatter-schema",
        severity: "error",
        message: `${err.instancePath || "root"}: ${err.message}`,
        line: 2,
      });
    }
  }

  return { frontmatter: fm, bodyStartLine: closeIndex + 2, diagnostics };
}

// ── Argument Placeholders ──────────────────────────────────────────────────

const VALID_PLACEHOLDER = /^\$([1-9]|@|ARGUMENTS|\{@:\d+(:\d+)?\})$/;
const ALL_DOLLAR_REFS = /\$(\{[^}]*\}|[A-Z_a-z0-9]+)/g;

function checkPlaceholders(content: string, file: string, bodyStartLine: number): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const lines = content.split("\n");

  for (let i = bodyStartLine - 1; i < lines.length; i++) {
    const line = lines[i]!;
    let match: RegExpExecArray | null;
    ALL_DOLLAR_REFS.lastIndex = 0;

    while ((match = ALL_DOLLAR_REFS.exec(line)) !== null) {
      const full = match[0];

      // Skip things that are clearly not template placeholders
      if (full === "$@") continue; // valid
      if (VALID_PLACEHOLDER.test(full)) continue;

      diagnostics.push({
        file,
        check: "placeholder",
        severity: "warning",
        message: `Suspicious placeholder '${full}'. Valid: $1–$9, $@, $ARGUMENTS, \${@:N}, \${@:N:L}.`,
        line: i + 1,
      });
    }
  }

  return diagnostics;
}

// ── Filename ───────────────────────────────────────────────────────────────

function checkFilename(file: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const name = basename(file, extname(file));

  if (extname(file) !== ".md") {
    diagnostics.push({ file, check: "filename", severity: "error", message: "Must have .md extension." });
  }

  if (name !== name.toLowerCase()) {
    diagnostics.push({ file, check: "filename", severity: "error", message: "Filename must be lowercase." });
  }

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    diagnostics.push({
      file,
      check: "filename",
      severity: "warning",
      message: `Filename '${name}' is not kebab-case (e.g., 'review-maintainability').`,
    });
  }

  return diagnostics;
}

// ── Runner ─────────────────────────────────────────────────────────────────

function validateFile(filePath: string): Diagnostic[] {
  const content = readFileSync(filePath, "utf-8");
  const diagnostics: Diagnostic[] = [];

  diagnostics.push(...checkFilename(filePath));

  const { bodyStartLine, diagnostics: fmDiags } = extractFrontmatter(content, filePath);
  diagnostics.push(...fmDiags);
  diagnostics.push(...checkPlaceholders(content, filePath, bodyStartLine));

  return diagnostics;
}

function resolveInputs(args: string[]): string[] {
  const files: string[] = [];
  for (const arg of args) {
    const p = resolve(arg);
    if (statSync(p).isDirectory()) {
      for (const entry of readdirSync(p)) {
        if (entry.endsWith(".md")) files.push(resolve(p, entry));
      }
    } else {
      files.push(p);
    }
  }
  return files;
}

// ── Main ───────────────────────────────────────────────────────────────────

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error("Usage: tsx validate-prompt.ts <file.md | directory> ...");
  process.exit(2);
}

const files = resolveInputs(inputs);
if (files.length === 0) {
  console.error("No .md files found.");
  process.exit(2);
}

let allDiagnostics: Diagnostic[] = [];

for (const file of files) {
  allDiagnostics.push(...validateFile(file));
}

// ── Output ─────────────────────────────────────────────────────────────────

const { errors } = printDiagnostics(allDiagnostics, `${files.length} file(s) passed all checks.`);
process.exit(errors > 0 ? 1 : 0);
