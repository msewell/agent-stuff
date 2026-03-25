import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { printDiagnostics, type Diagnostic } from "./validation-common.js";

// ── Helpers ────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  // Match GFM anchor generation: strip non-alphanumeric (keep spaces/hyphens),
  // replace spaces with hyphens, but do NOT collapse multiple hyphens.
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s/g, "-")
    .replace(/^-|-$/g, "");
}

function parseHeadings(lines: string[]): Array<{ level: number; text: string; slug: string; line: number }> {
  const headings: Array<{ level: number; text: string; slug: string; line: number }> = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!;
    if (raw.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = /^(#{1,6})\s+(.+)$/.exec(raw);
    if (match) {
      const level = match[1]!.length;
      const text = match[2]!.trim();
      headings.push({ level, text, slug: slugify(text), line: i + 1 });
    }
  }

  return headings;
}

// ── Check 1: ToC ↔ Heading Sync ───────────────────────────────────────────

function checkTocHeadingSync(lines: string[], file: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // Find ToC section
  let tocStart = -1;
  let tocEnd = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+Table of Contents/.test(lines[i]!)) {
      tocStart = i + 1;
    } else if (tocStart > 0 && tocEnd < 0 && /^---/.test(lines[i]!)) {
      tocEnd = i;
    }
  }

  if (tocStart < 0) {
    diagnostics.push({ file, check: "toc-sync", severity: "error", message: "No '## Table of Contents' section found." });
    return diagnostics;
  }

  // Extract ToC anchors
  const tocAnchors: Array<{ anchor: string; text: string; line: number }> = [];
  for (let i = tocStart; i < (tocEnd > 0 ? tocEnd : lines.length); i++) {
    const match = /\[([^\]]+)\]\(#([^)]+)\)/.exec(lines[i]!);
    if (match) {
      tocAnchors.push({ text: match[1]!, anchor: match[2]!, line: i + 1 });
    }
  }

  // Get all ## headings (top-level sections, excluding ToC itself)
  const headings = parseHeadings(lines);
  const topHeadings = headings.filter(
    (h) => h.level === 2 && !/Table of Contents/.test(h.text),
  );
  const allSlugs = new Set(headings.map((h) => h.slug));

  // Check: every ToC anchor points to an existing heading
  for (const toc of tocAnchors) {
    if (!allSlugs.has(toc.anchor)) {
      diagnostics.push({
        file,
        check: "toc-sync",
        severity: "error",
        message: `ToC link '#${toc.anchor}' does not match any heading slug.`,
        line: toc.line,
      });
    }
  }

  // Check: every ## heading has a ToC entry
  const tocAnchorSet = new Set(tocAnchors.map((t) => t.anchor));
  for (const h of topHeadings) {
    if (!tocAnchorSet.has(h.slug)) {
      diagnostics.push({
        file,
        check: "toc-sync",
        severity: "warning",
        message: `Heading '${h.text}' (slug: '${h.slug}') has no ToC entry.`,
        line: h.line,
      });
    }
  }

  return diagnostics;
}

// ── Check 2: Cross-Reference Integrity ────────────────────────────────────

function checkCrossReferences(lines: string[], file: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const headings = parseHeadings(lines);

  // Build sets of section numbers and phase numbers from headings
  // e.g., "## 3. Scalability Maturity Model" → section 3
  // e.g., "## 4. Phase 1 — Discovery" → phase 1
  const sectionNumbers = new Set<number>();
  const phaseNumbers = new Set<number>();
  const subSectionIds = new Set<string>(); // e.g., "3.3", "14.5"

  for (const h of headings) {
    // Top-level section number: "## 14. Phase 11 — ..."
    const secMatch = /^(\d+)\.\s/.exec(h.text);
    if (secMatch) sectionNumbers.add(parseInt(secMatch[1]!, 10));

    // Phase number: "Phase 11" in heading text
    const phaseMatch = /Phase\s+(\d+)/i.exec(h.text);
    if (phaseMatch) phaseNumbers.add(parseInt(phaseMatch[1]!, 10));

    // Subsection: "### 14.5 Cost Modeling" or "### 6.7.1 ..."
    const subMatch = /^(\d+\.\d+)/.exec(h.text);
    if (subMatch) subSectionIds.add(subMatch[1]!);
  }

  let inCodeBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.startsWith("```")) { inCodeBlock = !inCodeBlock; continue; }
    if (inCodeBlock) continue;

    // Skip lines that ARE headings (they define sections, not reference them)
    if (/^#{1,6}\s/.test(line)) continue;

    // "Section 21" references
    const sectionRefs = line.matchAll(/Section\s+(\d+)(?![\d.])/gi);
    for (const m of sectionRefs) {
      const num = parseInt(m[1]!, 10);
      if (!sectionNumbers.has(num)) {
        diagnostics.push({
          file,
          check: "cross-ref",
          severity: "error",
          message: `Reference to 'Section ${num}' but no heading starts with '${num}.'`,
          line: i + 1,
        });
      }
    }

    // "Section 14.5" subsection references
    const subRefs = line.matchAll(/Section\s+(\d+\.\d+)/gi);
    for (const m of subRefs) {
      const id = m[1]!;
      if (!subSectionIds.has(id)) {
        diagnostics.push({
          file,
          check: "cross-ref",
          severity: "error",
          message: `Reference to 'Section ${id}' but no subsection heading '${id}' found.`,
          line: i + 1,
        });
      }
    }

    // "Phase 8" references (in body text, not headings)
    const phaseRefs = line.matchAll(/Phase\s+(\d+)(?!\s*[—–\-|:])/gi);
    for (const m of phaseRefs) {
      const num = parseInt(m[1]!, 10);
      if (!phaseNumbers.has(num)) {
        // Check if it's inside a table cell referencing phase numbers like "1, 2, 3, 5, 8"
        // These are shorthand and valid — skip if in a table row with comma-separated phases
        if (/\|.*Phase/.test(line) || /Phases?\s+\d+(,\s*\d+)*/.test(line)) continue;
        diagnostics.push({
          file,
          check: "cross-ref",
          severity: "warning",
          message: `Reference to 'Phase ${num}' but no heading defines Phase ${num}.`,
          line: i + 1,
        });
      }
    }
  }

  return diagnostics;
}

// ── Check 3: Heading Hierarchy ────────────────────────────────────────────

function checkHeadingHierarchy(lines: string[], file: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const headings = parseHeadings(lines);

  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1]!;
    const curr = headings[i]!;
    // It's fine to go from deeper back to shallower (e.g., ### → ##)
    // It's only an error to skip forward (e.g., ## → ####)
    if (curr.level > prev.level + 1) {
      diagnostics.push({
        file,
        check: "heading-hierarchy",
        severity: "error",
        message: `Heading level jumps from H${prev.level} to H${curr.level} (skipped H${prev.level + 1}). Heading: '${curr.text}'`,
        line: curr.line,
      });
    }
  }

  return diagnostics;
}

// ── Check 4: Table Column Consistency ─────────────────────────────────────

function checkTableColumns(lines: string[], file: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  let inCodeBlock = false;
  let tableStart = -1;
  let expectedCols = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.startsWith("```")) { inCodeBlock = !inCodeBlock; continue; }
    if (inCodeBlock) continue;

    const trimmed = line.trim();
    const isTableRow = trimmed.startsWith("|") && trimmed.endsWith("|");

    if (isTableRow) {
      const cols = trimmed.split("|").length - 2; // strip leading/trailing empty splits
      if (tableStart < 0) {
        // First row of a new table (header)
        tableStart = i;
        expectedCols = cols;
      } else if (cols !== expectedCols) {
        // Separator rows: count dashes-only cells
        const isSeparator = /^\|[\s:-]+\|$/.test(trimmed.replace(/\|[\s:-]+/g, "|---").replace(/---\|/g, "---|"));
        if (!isSeparator || cols !== expectedCols) {
          diagnostics.push({
            file,
            check: "table-columns",
            severity: "error",
            message: `Table row has ${cols} columns, expected ${expectedCols} (table started at line ${tableStart + 1}).`,
            line: i + 1,
          });
        }
      }
    } else {
      // Not a table row — reset
      tableStart = -1;
      expectedCols = -1;
    }
  }

  return diagnostics;
}

// ── Check 5: Maturity Model Weights ───────────────────────────────────────

function checkMaturityWeights(lines: string[], file: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // Find the weights block (inside a code fence in Section 3.3)
  let inWeightsBlock = false;
  let weightsBlockLine = -1;
  const percentages: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    if (/Recommended Weights/.test(line)) {
      inWeightsBlock = true;
      weightsBlockLine = i + 1;
      continue;
    }
    if (inWeightsBlock && line.startsWith("```")) {
      inWeightsBlock = false;
      continue;
    }
    if (inWeightsBlock) {
      const pctMatch = /(\d+)%/.exec(line);
      if (pctMatch) {
        percentages.push(parseInt(pctMatch[1]!, 10));
      }
    }
  }

  if (percentages.length > 0) {
    const sum = percentages.reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      diagnostics.push({
        file,
        check: "maturity-weights",
        severity: "error",
        message: `Maturity model dimension weights sum to ${sum}%, expected 100%.`,
        line: weightsBlockLine,
      });
    }
  }

  // Check score ranges in Section 3.4 for contiguity
  const scoreRanges: Array<{ low: number; high: number; line: number }> = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    // Match "| **1.0–1.9** |" or similar
    const rangeMatch = /\*\*(\d+\.?\d*)[\u2013\u2014-](\d+\.?\d*)\*\*/.exec(line);
    if (rangeMatch) {
      scoreRanges.push({
        low: parseFloat(rangeMatch[1]!),
        high: parseFloat(rangeMatch[2]!),
        line: i + 1,
      });
    }
  }

  if (scoreRanges.length > 1) {
    // Sort by low bound
    scoreRanges.sort((a, b) => a.low - b.low);

    for (let i = 1; i < scoreRanges.length; i++) {
      const prev = scoreRanges[i - 1]!;
      const curr = scoreRanges[i]!;
      const expectedNext = Math.round((prev.high + 0.1) * 10) / 10;
      if (Math.abs(curr.low - expectedNext) > 0.01) {
        diagnostics.push({
          file,
          check: "maturity-score-ranges",
          severity: "error",
          message: `Score range gap or overlap: previous range ends at ${prev.high}, next starts at ${curr.low} (expected ${expectedNext}).`,
          line: curr.line,
        });
      }
    }
  }

  return diagnostics;
}

// ── Check 6: Link Well-Formedness ─────────────────────────────────────────

function checkLinks(lines: string[], file: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.startsWith("```")) { inCodeBlock = !inCodeBlock; continue; }
    if (inCodeBlock) continue;

    // Match [text](url) but not [text](#anchor)
    const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(line)) !== null) {
      const url = match[2]!;

      // Skip internal anchors
      if (url.startsWith("#")) continue;

      // Validate URL
      try {
        new URL(url);
      } catch {
        diagnostics.push({
          file,
          check: "link-url",
          severity: "error",
          message: `Malformed URL: '${url}'`,
          line: i + 1,
        });
      }
    }
  }

  return diagnostics;
}

// ── Check 7: Duplicate Headings ───────────────────────────────────────────

function checkDuplicateHeadings(lines: string[], file: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const headings = parseHeadings(lines);
  const seen = new Map<string, number>(); // slug → first line

  for (const h of headings) {
    const existing = seen.get(h.slug);
    if (existing !== undefined) {
      diagnostics.push({
        file,
        check: "duplicate-heading",
        severity: "warning",
        message: `Duplicate heading slug '${h.slug}' (first at line ${existing}). Anchor links will collide.`,
        line: h.line,
      });
    } else {
      seen.set(h.slug, h.line);
    }
  }

  return diagnostics;
}

// ── Check 8: Checklist Syntax ─────────────────────────────────────────────

function checkChecklistSyntax(lines: string[], file: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.startsWith("```")) { inCodeBlock = !inCodeBlock; continue; }
    if (inCodeBlock) continue;

    // Detect broken checkbox patterns
    if (/^-\s*\[\S\]/.test(line.trim()) && !/^-\s*\[\s\]/.test(line.trim()) && !/^-\s*\[x\]/i.test(line.trim())) {
      diagnostics.push({
        file,
        check: "checklist-syntax",
        severity: "error",
        message: `Malformed checkbox. Expected '- [ ]' or '- [x]', got: '${line.trim().slice(0, 30)}'`,
        line: i + 1,
      });
    }

    // Detect "- []" (missing space)
    if (/^-\s*\[\]/.test(line.trim())) {
      diagnostics.push({
        file,
        check: "checklist-syntax",
        severity: "error",
        message: `Empty checkbox '- []' missing space. Should be '- [ ]'.`,
        line: i + 1,
      });
    }
  }

  return diagnostics;
}

// ── Check 9: Duplicate Source URLs ────────────────────────────────────────

function checkDuplicateUrls(lines: string[], file: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // Only check in Sources section
  let inSources = false;
  const urlMap = new Map<string, number>(); // url → first line

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^##\s+\d+\.\s+Sources/.test(line) || /^##\s+Sources/.test(line)) {
      inSources = true;
      continue;
    }
    if (inSources && /^##\s/.test(line) && !/^###/.test(line)) {
      break; // Left the sources section
    }

    if (!inSources) continue;

    const match = /\]\((https?:\/\/[^)]+)\)/.exec(line);
    if (match) {
      const url = match[1]!;
      const existing = urlMap.get(url);
      if (existing !== undefined) {
        diagnostics.push({
          file,
          check: "duplicate-url",
          severity: "warning",
          message: `Duplicate source URL (first at line ${existing}): ${url}`,
          line: i + 1,
        });
      } else {
        urlMap.set(url, i + 1);
      }
    }
  }

  return diagnostics;
}

// ── Check 10: Internal Anchor References ──────────────────────────────────

function checkInternalAnchors(lines: string[], file: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const headings = parseHeadings(lines);
  const allSlugs = new Set(headings.map((h) => h.slug));
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.startsWith("```")) { inCodeBlock = !inCodeBlock; continue; }
    if (inCodeBlock) continue;

    // Match [text](#anchor) internal links
    const anchorRegex = /\[([^\]]*)\]\(#([^)]+)\)/g;
    let match: RegExpExecArray | null;

    while ((match = anchorRegex.exec(line)) !== null) {
      const anchor = match[2]!;
      if (!allSlugs.has(anchor)) {
        diagnostics.push({
          file,
          check: "internal-anchor",
          severity: "error",
          message: `Internal link '#${anchor}' does not match any heading slug.`,
          line: i + 1,
        });
      }
    }
  }

  return diagnostics;
}

// ── Runner ─────────────────────────────────────────────────────────────────

function validateFile(filePath: string): Diagnostic[] {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const diagnostics: Diagnostic[] = [];

  diagnostics.push(...checkTocHeadingSync(lines, filePath));
  diagnostics.push(...checkCrossReferences(lines, filePath));
  diagnostics.push(...checkHeadingHierarchy(lines, filePath));
  diagnostics.push(...checkTableColumns(lines, filePath));
  diagnostics.push(...checkMaturityWeights(lines, filePath));
  diagnostics.push(...checkLinks(lines, filePath));
  diagnostics.push(...checkDuplicateHeadings(lines, filePath));
  diagnostics.push(...checkChecklistSyntax(lines, filePath));
  diagnostics.push(...checkDuplicateUrls(lines, filePath));
  diagnostics.push(...checkInternalAnchors(lines, filePath));

  return diagnostics;
}

// ── Main ───────────────────────────────────────────────────────────────────

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error("Usage: tsx validate-guide.ts <file.md> ...");
  process.exit(2);
}

const files = inputs.map((f) => resolve(f));
for (const f of files) {
  try {
    statSync(f);
  } catch {
    console.error(`File not found: ${f}`);
    process.exit(2);
  }
}

let allDiagnostics: Diagnostic[] = [];
for (const file of files) {
  allDiagnostics.push(...validateFile(file));
}

// ── Output ─────────────────────────────────────────────────────────────────

const { errors } = printDiagnostics(allDiagnostics, `${files.length} file(s) passed all checks.`);
process.exit(errors > 0 ? 1 : 0);
