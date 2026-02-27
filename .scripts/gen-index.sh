#!/usr/bin/env bash
# Regenerates the index tables in README.md from artifact frontmatter.
# Scans for SKILL.md files and prompts/*.md files.
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
echo "| Artifact | Description |" >> "$SKILLS_INDEX"
echo "|----------|-------------|" >> "$SKILLS_INDEX"

while IFS= read -r -d '' file; do
  name=$(awk '/^name:/{gsub(/^name:[[:space:]]*/,""); gsub(/^"/,""); gsub(/"$/,""); print; exit}' "$file")
  desc=$(awk '/^description:/{gsub(/^description:[[:space:]]*/,""); gsub(/^"/,""); gsub(/"$/,""); print; exit}' "$file")
  rel_path=$(python3 -c "import os,sys; print(os.path.relpath(sys.argv[1], sys.argv[2]))" "$(dirname "$file")" "$REPO_ROOT")
  echo "| [$name]($rel_path) | $desc |" >> "$SKILLS_INDEX"
done < <(find "$REPO_ROOT" -not -path '*/.git/*' -not -path '*/.archive/*' -name "SKILL.md" -print0 | sort -z)

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

echo "Index updated in README.md"
