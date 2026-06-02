#!/usr/bin/env bash
# release.sh — prep and open a PR for a new release
# Usage: ./scripts/release.sh [patch|minor|major]
set -e

BUMP=${1:-patch}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ── 1. Check git is clean ─────────────────────────────────────────────────────
echo "▶ Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Working directory is not clean. Commit or stash your changes first."
  git status --short
  exit 1
fi
echo "✅ Git is clean"

# ── 2. Make sure we're on a feature branch (not main) ────────────────────────
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" = "main" ]; then
  echo "❌ You're on main. Create a release branch first:"
  echo "   git checkout -b release/vX.Y.Z"
  exit 1
fi
echo "✅ On branch: $BRANCH"

# ── 3. Check CHANGELOG has an [Unreleased] section with content ───────────────
echo "▶ Checking CHANGELOG..."
UNRELEASED_CONTENT=$(awk '/^## \[Unreleased\]/{found=1; next} found && /^## \[/{exit} found && /[^ \t]/{print}' CHANGELOG.md)
if [ -z "$UNRELEASED_CONTENT" ]; then
  echo "❌ CHANGELOG.md has no content under [Unreleased]. Add your changes before releasing."
  exit 1
fi
echo "✅ CHANGELOG has unreleased content:"
echo "$UNRELEASED_CONTENT" | head -5
echo ""

# ── 4. Determine current version ─────────────────────────────────────────────
CURRENT=$(node -p "require('./public/manifest.json').version")
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

case "$BUMP" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
  *)
    echo "❌ Invalid bump type: $BUMP (use patch, minor, or major)"
    exit 1
    ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
echo "▶ Version: $CURRENT → $NEW_VERSION"

# ── 5. Push branch to remote ─────────────────────────────────────────────────
echo "▶ Pushing branch to remote..."
git push -u origin "$BRANCH"
echo "✅ Branch pushed"

# ── 6. Create the PR ──────────────────────────────────────────────────────────
echo "▶ Creating PR..."
PR_TITLE="v$NEW_VERSION"
PR_BODY=$(printf "## What's changed\n\n%s\n\n---\n*Version bump: %s → %s (%s)*" \
  "$UNRELEASED_CONTENT" "$CURRENT" "$NEW_VERSION" "$BUMP")

PR_URL=$(gh pr create \
  --base main \
  --head "$BRANCH" \
  --title "$PR_TITLE" \
  --body "$PR_BODY" \
  --label "$BUMP")

echo "✅ PR created: $PR_URL"

# ── 7. Open the PR in the browser ────────────────────────────────────────────
echo "▶ Opening PR in browser..."
open "$PR_URL"
