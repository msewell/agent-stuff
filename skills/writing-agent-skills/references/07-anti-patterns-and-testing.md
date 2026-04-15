# Anti-Patterns and Testing

## Table of Contents

- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
- [Testing and Iteration](#testing-and-iteration)

---

## Anti-Patterns to Avoid

### The Kitchen Sink

Cramming everything into `SKILL.md` instead of using progressive disclosure.
If your `SKILL.md` exceeds 500 lines, split it.

### Teaching the Agent What It Already Knows

```markdown
# BAD: Explaining Python basics in a Python skill
Python is a high-level programming language. It uses indentation
for code blocks. Variables are dynamically typed...
```

The agent knows Python. Tell it which library to use and what API to call.

### Deeply Nested References

```markdown
# BAD: reference chain
SKILL.md → advanced.md → details.md → actual_info.md
```

Agents may partially read deeply nested files. Keep all references one level
deep from `SKILL.md`.

### Time-Sensitive Information

```markdown
# BAD
If you're doing this before the migration date, use the old API.
After the migration date, use the new API.
```

```markdown
# GOOD
## Current method
Use the v2 API endpoint: `api.example.com/v2/messages`

## Legacy patterns
<details>
<summary>Legacy v1 API (deprecated)</summary>
The v1 API used: `api.example.com/v1/messages`
This endpoint is no longer supported.
</details>
```

### Too Many Options Without a Default

```markdown
# BAD
You can use pypdf, or pdfplumber, or PyMuPDF, or pdf2image, or pdfminer...
```

Pick a default. Offer alternatives only for specific edge cases.

### Windows-Style Paths

```markdown
# BAD
scripts\helper.py
reference\guide.md

# GOOD
scripts/helper.py
reference/guide.md
```

Unix-style paths work everywhere. Windows-style paths break on Unix systems.

### Assuming Tools Are Installed

```markdown
# BAD
Use the pdf library to process the file.

# GOOD
Install required package: `pip install pypdf`
```

### Voodoo Constants in Scripts

```python
# BAD
TIMEOUT = 47
RETRIES = 5

# GOOD — self-documenting
REQUEST_TIMEOUT = 30  # Most HTTP requests complete within 30s
MAX_RETRIES = 3       # Most transient failures resolve by retry 2
```

### Punting Errors to the Agent

```python
# BAD — raw exception, agent has to debug
return open(path).read()

# GOOD — handle the error, provide context
try:
    with open(path) as f:
        return f.read()
except FileNotFoundError:
    print(f"File {path} not found, creating with defaults")
    Path(path).write_text("")
    return ""
```

### Extraneous Documentation Files

Do not create `README.md`, `CHANGELOG.md`, `QUICK_REFERENCE.md`, or similar
files inside a skill. The skill should contain only what the agent needs.

---

## Testing and Iteration

### Evaluation-Driven Development

Create evaluations **before** writing extensive documentation. This ensures
your skill solves real problems rather than documenting imagined ones.

**Process:**

1. **Identify gaps.** Run the agent on representative tasks without a skill.
   Document specific failures or missing context.
2. **Create evaluations.** Build at least three scenarios that test these gaps.
3. **Establish baseline.** Measure the agent's performance without the skill.
4. **Write minimal instructions.** Create just enough content to address the
   gaps and pass evaluations.
5. **Iterate.** Run evaluations, compare against baseline, refine.

### The Two-Instance Workflow

The most effective development process uses two agent instances:

- **Agent A** (the skill designer): Helps you create and refine the skill
- **Agent B** (the skill user): Tests the skill in a fresh session

**Creating a new skill:**

1. Complete a task with Agent A using normal prompting. Notice what information
   you repeatedly provide — that repetition is your skill's content.
2. Ask Agent A to create a `SKILL.md` from those patterns.
3. Review for conciseness. Agents tend to over-explain. Cut anything the agent
   would already know.
4. Improve information architecture — ask Agent A to split detailed content
   into reference files.
5. Test with Agent B (fresh session, skill loaded) on related tasks.
6. If Agent B struggles, return to Agent A with specifics.

**Iterating on existing skills:**

1. Use the skill with Agent B on real tasks — not test scenarios.
2. Observe where it struggles, succeeds, or makes unexpected choices.
3. Return to Agent A with observations and current `SKILL.md`.
4. Apply refinements, test again with Agent B.

### What to Watch For

- **Unexpected exploration paths:** Does the agent read files in an unexpected
  order? Your structure may not be as intuitive as you thought.
- **Missed connections:** Does the agent fail to follow references? Links may
  need to be more explicit or prominent.
- **Overreliance on certain sections:** If the agent repeatedly reads the same
  reference file, consider promoting that content to `SKILL.md`.
- **Ignored content:** If the agent never accesses a bundled file, it may be
  unnecessary or poorly signaled.

### Test Across Models

- **Smaller/faster models** (e.g., Haiku): May need more explicit instructions.
- **Balanced models** (e.g., Sonnet): Aim for clear and efficient.
- **Powerful models** (e.g., Opus): May perform worse with overly prescriptive
  instructions.

Aim for instructions that work well across your target models.
