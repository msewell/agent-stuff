# Bundled Resources

## Table of Contents

- [scripts/ — Executable Code](#scripts--executable-code)
- [references/ — On-Demand Documentation](#references--on-demand-documentation)
- [assets/ — Output Resources](#assets--output-resources)
- [What NOT to Include](#what-not-to-include)

---

## `scripts/` — Executable Code

Scripts provide deterministic, token-efficient operations. Even if the agent
could write the same code, pre-made scripts offer advantages:

- **More reliable** than generated code
- **Save tokens** — no need to include code in context
- **Save time** — no code generation required
- **Ensure consistency** across uses

**When to include a script:**
- The same code is being rewritten repeatedly
- Deterministic reliability is needed
- The operation is fragile or error-prone

**Script authoring rules:**

1. **Handle errors explicitly.** Don't punt errors to the agent.

   Good:
   ```python
   def process_file(path):
       try:
           with open(path) as f:
               return f.read()
       except FileNotFoundError:
           print(f"File {path} not found, creating default")
           with open(path, "w") as f:
               f.write("")
           return ""
   ```

   Bad:
   ```python
   def process_file(path):
       return open(path).read()  # fails, agent has to debug
   ```

2. **Document magic numbers.** No "voodoo constants."

   Good:
   ```python
   # HTTP requests typically complete within 30 seconds.
   # Longer timeout accounts for slow connections.
   REQUEST_TIMEOUT = 30
   ```

   Bad:
   ```python
   TIMEOUT = 47  # Why 47?
   ```

3. **Make scripts self-contained** or clearly document dependencies.

4. **Include helpful error messages** with context:
   ```python
   # Instead of: "Field not found"
   # Write:
   print(f"Field '{name}' not found. Available: {', '.join(available)}")
   ```

5. **Be explicit about execution vs. reading.** In your `SKILL.md`, clarify
   whether the agent should execute the script or read it as reference:
   - "Run `scripts/analyze_form.py` to extract fields" (execute)
   - "See `scripts/analyze_form.py` for the extraction algorithm" (read)

6. **List required packages** and verify availability:
   ````markdown
   Install required package: `pip install pypdf`

   Then use it:
   ```python
   from pypdf import PdfReader
   reader = PdfReader("file.pdf")
   ```
   ````

---

## `references/` — On-Demand Documentation

Reference files are documentation the agent loads into context as needed.

**Good candidates for reference files:**
- Database schemas and table documentation
- API specifications
- Domain-specific knowledge (legal, finance, etc.)
- Company policies and style guides
- Detailed workflow guides

**Key principle:** Information should live in either `SKILL.md` or reference
files, **not both**. Prefer reference files for detailed information — this
keeps `SKILL.md` lean while making everything discoverable.

---

## `assets/` — Output Resources

Assets are files used in the output the agent produces, not loaded into
context.

**Examples:**
- Document templates (`.pptx`, `.docx`)
- Brand assets (`logo.png`)
- Boilerplate code (`frontend-template/`)
- Fonts, icons, sample documents

Assets are **copied or modified** by the agent, not read for understanding.

---

## What NOT to Include

A skill should contain only files that directly support its functionality.
Do not create:

- `README.md`
- `INSTALLATION_GUIDE.md`
- `QUICK_REFERENCE.md`
- `CHANGELOG.md`
- Any auxiliary documentation about the skill itself
