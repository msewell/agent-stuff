export interface Diagnostic {
  file: string;
  check: string;
  severity: "error" | "warning";
  message: string;
  line?: number;
}

export function printDiagnostics(diagnostics: Diagnostic[], successMessage: string): {
  errors: number;
  warnings: number;
} {
  const errors = diagnostics.filter((d) => d.severity === "error").length;
  const warnings = diagnostics.filter((d) => d.severity === "warning").length;

  for (const d of diagnostics) {
    const loc = d.line ? `:${d.line}` : "";
    const tag = d.severity === "error" ? "\x1b[31mERR\x1b[0m" : "\x1b[33mWARN\x1b[0m";
    console.log(`${tag}  ${d.file}${loc}  [${d.check}] ${d.message}`);
  }

  if (diagnostics.length === 0) {
    console.log(`\x1b[32m✓\x1b[0m  ${successMessage}`);
  }

  console.log(`\n${errors} error(s), ${warnings} warning(s)`);
  return { errors, warnings };
}
