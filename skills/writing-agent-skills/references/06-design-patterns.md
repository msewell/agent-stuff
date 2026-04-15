# Design Patterns

## Table of Contents

- [Template Pattern](#template-pattern)
- [Examples Pattern](#examples-pattern)
- [Workflow Pattern](#workflow-pattern)
- [Conditional Workflow Pattern](#conditional-workflow-pattern)
- [Feedback Loop Pattern](#feedback-loop-pattern)
- [Plan-Validate-Execute Pattern](#plan-validate-execute-pattern)
- [Visual Analysis Pattern](#visual-analysis-pattern)
- [Routing Guidance Pattern](#routing-guidance-pattern)
- [MCP Tool Reference Pattern](#mcp-tool-reference-pattern)

---

## Template Pattern

Provide templates when you need consistent output formats.

**For strict requirements** (API responses, data formats):

````markdown
## Report structure

ALWAYS use this exact template:

```markdown
# [Analysis Title]

## Executive summary
[One-paragraph overview of key findings]

## Key findings
- Finding 1 with supporting data
- Finding 2 with supporting data

## Recommendations
1. Specific actionable recommendation
2. Specific actionable recommendation
```
````

**For flexible guidance** (when adaptation is useful):

````markdown
## Report structure

Sensible default format — adjust sections as needed:

```markdown
# [Analysis Title]

## Executive summary
[Overview]

## Key findings
[Adapt based on what you discover]

## Recommendations
[Tailor to specific context]
```
````

---

## Examples Pattern

Input/output pairs help agents understand desired style and detail level more
effectively than descriptions alone:

````markdown
## Commit message format

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**Example 2:**
Input: Fixed bug where dates displayed incorrectly in reports
Output:
```
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation
```
````

---

## Workflow Pattern

Break complex operations into clear, sequential steps. For particularly complex
workflows, provide a checklist the agent can track:

````markdown
## PDF form filling workflow

Copy this checklist and track progress:

```
- [ ] Step 1: Analyze the form (run analyze_form.py)
- [ ] Step 2: Create field mapping (edit fields.json)
- [ ] Step 3: Validate mapping (run validate_fields.py)
- [ ] Step 4: Fill the form (run fill_form.py)
- [ ] Step 5: Verify output (run verify_output.py)
```

**Step 1: Analyze the form**
Run: `python scripts/analyze_form.py input.pdf`
This extracts form fields and their locations, saving to `fields.json`.

**Step 2: Create field mapping**
Edit `fields.json` to add values for each field.

**Step 3: Validate mapping**
Run: `python scripts/validate_fields.py fields.json`
Fix any validation errors before continuing.

**Step 4: Fill the form**
Run: `python scripts/fill_form.py input.pdf fields.json output.pdf`

**Step 5: Verify output**
Run: `python scripts/verify_output.py output.pdf`
If verification fails, return to Step 2.
````

---

## Conditional Workflow Pattern

Guide the agent through decision points:

```markdown
## Document modification workflow

1. Determine the modification type:

   **Creating new content?** → Follow "Creation workflow" below
   **Editing existing content?** → Follow "Editing workflow" below

2. Creation workflow:
   - Use docx-js library
   - Build document from scratch
   - Export to .docx format

3. Editing workflow:
   - Unpack existing document
   - Modify XML directly
   - Validate after each change
   - Repack when complete
```

If workflows become large, push them into separate reference files and tell the
agent to read the appropriate file based on the task.

---

## Feedback Loop Pattern

The run → validate → fix → repeat pattern dramatically improves output quality:

````markdown
## Document editing process

1. Make your edits to `word/document.xml`
2. **Validate immediately**: `python scripts/validate.py unpacked_dir/`
3. If validation fails:
   - Review the error message carefully
   - Fix the issues in the XML
   - Run validation again
4. **Only proceed when validation passes**
5. Rebuild: `python scripts/pack.py unpacked_dir/ output.docx`
6. Test the output document
````

---

## Plan-Validate-Execute Pattern

For complex, open-ended tasks, have the agent create a machine-verifiable plan
before executing:

```markdown
## Batch update workflow

1. Analyze inputs → produce `changes.json`
2. Validate plan: `python scripts/validate_plan.py changes.json`
3. Only if validation passes → execute: `python scripts/apply.py changes.json`
4. Verify results: `python scripts/verify.py output/`
```

This pattern catches errors early, keeps planning reversible, and provides
clear debugging when things go wrong.

---

## Visual Analysis Pattern

When inputs can be rendered as images, leverage the agent's vision capabilities:

````markdown
## Form layout analysis

1. Convert PDF to images:
   ```bash
   python scripts/pdf_to_images.py form.pdf
   ```

2. Analyze each page image to identify form fields
3. Map field locations based on visual analysis
````

---

## Routing Guidance Pattern

Add explicit routing guidance to help agents select the right skill:

```markdown
## When to use this skill

Use when:
- The user asks to create a .docx file
- The user wants to edit an existing Word document
- The user mentions tracked changes or document review

Do NOT use when:
- The user wants plain text or Markdown output
- The user is working with PDFs (use pdf-processing instead)
- The user needs a spreadsheet (use xlsx-processing instead)
```

Note: this section is useful when placed in the body as secondary routing
refinement. The primary routing still happens via the `description` field.

---

## MCP Tool Reference Pattern

When your skill uses MCP tools, always use fully qualified names:

```markdown
Use the BigQuery:bigquery_schema tool to retrieve table schemas.
Use the GitHub:create_issue tool to create issues.
```

Without the server prefix (`BigQuery:`, `GitHub:`), the agent may fail to
locate the tool.
