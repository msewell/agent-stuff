#!/usr/bin/env bash
# Regenerates the index table in README.md from artifact frontmatter.
# Scans for SKILL.md files; extend the loop below for other artifact types.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
README="$REPO_ROOT/README.md"
INDEX_FILE="$(mktemp)"

# Build the index content into a temp file
echo "| Artifact | Description |" >> "$INDEX_FILE"
echo "|----------|-------------|" >> "$INDEX_FILE"

while IFS= read -r -d '' file; do
  name=$(awk '/^name:/{gsub(/^name:[[:space:]]*/,""); print; exit}' "$file")
  desc=$(awk '/^description:/{gsub(/^description:[[:space:]]*/,""); print; exit}' "$file")
  rel_path=$(python3 -c "import os,sys; print(os.path.relpath(sys.argv[1], sys.argv[2]))" "$(dirname "$file")" "$REPO_ROOT")
  echo "| [$name]($rel_path) | $desc |" >> "$INDEX_FILE"
done < <(find "$REPO_ROOT" -not -path '*/.git/*' -name "SKILL.md" -print0 | sort -z)

# Replace content between sentinel comments in README.md
python3 - "$README" "$INDEX_FILE" <<'EOF'
import sys

readme_path, index_path = sys.argv[1], sys.argv[2]

with open(readme_path) as f:
    readme = f.read()

with open(index_path) as f:
    index = f.read().strip()

start_marker = "<!-- INDEX:START -->"
end_marker = "<!-- INDEX:END -->"

start = readme.index(start_marker) + len(start_marker)
end = readme.index(end_marker)

new_readme = readme[:start] + "\n" + index + "\n" + readme[end:]

with open(readme_path, "w") as f:
    f.write(new_readme)
EOF

rm "$INDEX_FILE"
echo "Index updated in README.md"
