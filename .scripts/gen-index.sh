#!/usr/bin/env bash
# Regenerates the index tables in README.md from artifact frontmatter.
# Scans for SKILL.md files and prompts/*.md files.
#
# Rules enforced for skills:
#   - Every SKILL.md must have a `category:` field (hard error)
#   - No category may contain more than 10 skills (hard error)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
README="$REPO_ROOT/README.md"

replace_section() {
  local start_marker="$1"
  local end_marker="$2"
  local index_file="$3"

  python3 - "$README" "$index_file" "$start_marker" "$end_marker" <<'EOF'
import sys

readme_path, index_path, start_marker, end_marker = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]

with open(readme_path) as f:
    readme = f.read()

with open(index_path) as f:
    index = f.read().strip()

start = readme.index(start_marker) + len(start_marker)
end = readme.index(end_marker)

new_readme = readme[:start] + "\n" + index + "\n" + readme[end:]

with open(readme_path, "w") as f:
    f.write(new_readme)
EOF
}

# --- Skills ---
SKILLS_INDEX="$(mktemp)"

python3 - "$REPO_ROOT" "$SKILLS_INDEX" <<'EOF'
import sys
import os
import subprocess
from collections import defaultdict

repo_root, output_path = sys.argv[1], sys.argv[2]

# Collect all SKILL.md files
skill_files = []
for dirpath, dirnames, filenames in os.walk(repo_root):
    # Skip .git and .archive
    dirnames[:] = [d for d in dirnames if d not in ('.git', '.archive')]
    if 'SKILL.md' in filenames:
        skill_files.append(os.path.join(dirpath, 'SKILL.md'))
skill_files.sort()

errors = []
categories = defaultdict(list)  # category -> list of (name, rel_path, desc)

for path in skill_files:
    with open(path) as f:
        content = f.read()

    # Parse frontmatter (between first two ---)
    lines = content.split('\n')
    fm = {}
    in_fm = False
    fm_done = False
    dash_count = 0
    for line in lines:
        if line.strip() == '---':
            dash_count += 1
            if dash_count == 1:
                in_fm = True
            elif dash_count == 2:
                fm_done = True
                break
        elif in_fm:
            if ':' in line:
                key, _, val = line.partition(':')
                fm[key.strip()] = val.strip().strip('"')

    name = fm.get('name', '')
    desc = fm.get('description', '')
    category = fm.get('category', '')

    rel_dir = os.path.relpath(os.path.dirname(path), repo_root)

    if not category:
        errors.append(f"ERROR: missing 'category' field in {path}")
        continue

    categories[category].append((name, rel_dir, desc))

# Check category size limit
MAX_PER_CATEGORY = 10
for cat, skills in categories.items():
    if len(skills) > MAX_PER_CATEGORY:
        errors.append(
            f"ERROR: category '{cat}' has {len(skills)} skills (max {MAX_PER_CATEGORY}): "
            + ", ".join(s[0] for s in skills)
        )

if errors:
    for e in errors:
        print(e, file=sys.stderr)
    sys.exit(1)

# Defined display order for categories
CATEGORY_ORDER = ["Software Engineering", "Writing & Communication", "Agent Tooling"]

ordered = []
seen = set()
for cat in CATEGORY_ORDER:
    if cat in categories:
        ordered.append(cat)
        seen.add(cat)
# Append any unknown categories alphabetically (future-proofing)
for cat in sorted(categories):
    if cat not in seen:
        ordered.append(cat)

lines_out = []
for cat in ordered:
    skills = sorted(categories[cat], key=lambda x: x[0])
    lines_out.append(f"### {cat}\n")
    lines_out.append("| Artifact | Description |")
    lines_out.append("|----------|-------------|")
    for name, rel_path, desc in skills:
        lines_out.append(f"| [{name}]({rel_path}) | {desc} |")
    lines_out.append("")  # blank line between sections

with open(output_path, 'w') as f:
    f.write('\n'.join(lines_out))
EOF

replace_section "<!-- SKILLS:START -->" "<!-- SKILLS:END -->" "$SKILLS_INDEX"
rm "$SKILLS_INDEX"

# --- Prompts ---
PROMPTS_INDEX="$(mktemp)"
echo "| Name | Description |" >> "$PROMPTS_INDEX"
echo "|------|-------------|" >> "$PROMPTS_INDEX"

while IFS= read -r -d '' file; do
  name=$(basename "$file" .md)
  desc=$(awk '/^description:/{gsub(/^description:[[:space:]]*/,""); gsub(/^"/,""); gsub(/"$/,""); print; exit}' "$file")
  rel_path=$(python3 -c "import os,sys; print(os.path.relpath(sys.argv[1], sys.argv[2]))" "$file" "$REPO_ROOT")
  echo "| [$name]($rel_path) | $desc |" >> "$PROMPTS_INDEX"
done < <(find "$REPO_ROOT/prompts" -not -path '*/.git/*' -name "*.md" -print0 | sort -z)

replace_section "<!-- PROMPTS:START -->" "<!-- PROMPTS:END -->" "$PROMPTS_INDEX"
rm "$PROMPTS_INDEX"

# --- Table of Contents ---
# Generated last so it reflects the fully-updated README.
TOC_INDEX="$(mktemp)"

python3 - "$README" "$TOC_INDEX" <<'EOF'
import sys
import re

readme_path, output_path = sys.argv[1], sys.argv[2]

with open(readme_path) as f:
    lines = f.readlines()

def heading_anchor(text):
    """Convert a heading to a GitHub-style anchor slug.

    GitHub's algorithm:
      1. Lowercase
      2. Remove anything that is not a word char, space, or hyphen
      3. Replace each space with a hyphen (no collapsing — two spaces → --)
    """
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)  # remove punctuation except hyphens
    text = text.replace(' ', '-')          # each space → hyphen (no collapse)
    return text

toc_lines = []
in_toc_block = False

for line in lines:
    stripped = line.rstrip()

    # Skip everything inside the TOC block itself to avoid self-reference
    if '<!-- TOC:START -->' in stripped:
        in_toc_block = True
        continue
    if '<!-- TOC:END -->' in stripped:
        in_toc_block = False
        continue
    if in_toc_block:
        continue

    m = re.match(r'^(#{2,3})\s+(.+)', stripped)
    if not m:
        continue

    hashes, title = m.group(1), m.group(2).strip()

    # Skip the TOC heading itself to avoid self-reference
    if title == 'Table of Contents':
        continue
    depth = len(hashes)  # 2 → top-level, 3 → one indent
    indent = '  ' * (depth - 2)
    anchor = heading_anchor(title)
    toc_lines.append(f"{indent}- [{title}](#{anchor})")

with open(output_path, 'w') as f:
    f.write('\n'.join(toc_lines) + '\n')
EOF

replace_section "<!-- TOC:START -->" "<!-- TOC:END -->" "$TOC_INDEX"
rm "$TOC_INDEX"

echo "Index updated in README.md"
