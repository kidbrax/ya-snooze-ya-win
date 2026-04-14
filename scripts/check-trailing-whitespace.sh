#!/usr/bin/env bash
# Checks for trailing whitespace in tracked source files.
# Exits with code 1 if any is found.

set -euo pipefail

files=$(git ls-files -- '*.js' '*.jsx' '*.ts' '*.tsx' '*.css' '*.html' '*.json' '*.md' '*.yml' '*.yaml' '*.sh')

bad_files=()
while IFS= read -r f; do
  if grep -En '[[:space:]]+$' "$f" > /dev/null 2>&1; then
    bad_files+=("$f")
  fi
done <<< "$files"

if [ ${#bad_files[@]} -gt 0 ]; then
  echo "❌ Trailing whitespace found in ${#bad_files[@]} file(s):"
  echo ""
  for f in "${bad_files[@]}"; do
    grep -En '[[:space:]]+$' "$f" | while IFS= read -r line; do
      echo "  $f:$line"
    done
  done
  echo ""
  echo "Fix with: sed -i 's/[[:space:]]*$//' <file>"
  exit 1
fi

echo "✅ No trailing whitespace found."
