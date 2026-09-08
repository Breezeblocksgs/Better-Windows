#!/usr/bin/env bash
# Package the module and (with --publish) tag, push, and cut a GitHub Release
# matching the version currently in module.json.
#
# Usage:
#   tools/release.sh              # just build dist/module.zip
#   tools/release.sh --publish    # build, tag vX.Y.Z, push, and gh release create
#
# Set RELEASE_NOTES to override the default release notes text.
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION=$(python3 -c "import json; print(json.load(open('module.json'))['version'])")
TAG="v$VERSION"
DIST="dist"
PAYLOAD="$DIST/better-windows"

rm -rf "$DIST"
mkdir -p "$PAYLOAD"
cp -r module.json scripts styles lang icons README.md "$PAYLOAD/"

python3 - "$PAYLOAD" "$DIST/module.zip" <<'PY'
import sys, zipfile, os
payload, out = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for root, _dirs, files in os.walk(payload):
        for f in files:
            path = os.path.join(root, f)
            z.write(path, os.path.relpath(path, payload))
PY

echo "Packaged $DIST/module.zip for $TAG"

if [[ "${1:-}" != "--publish" ]]; then
  exit 0
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree not clean — commit or stash before publishing." >&2
  exit 1
fi

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Tag $TAG already exists — bump module.json's version first." >&2
  exit 1
fi

git tag -a "$TAG" -m "Better Windows $TAG"
git push origin main
git push origin "$TAG"

gh release create "$TAG" "$DIST/module.zip" module.json \
  --title "Better Windows $TAG" \
  --notes "${RELEASE_NOTES:-Release $TAG.}"

echo "Published $TAG: https://github.com/Breezeblocksgs/Better-Windows/releases/tag/$TAG"
