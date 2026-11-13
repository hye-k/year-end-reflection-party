#!/usr/bin/env bash
# Builds the site and publishes the result to the gh-pages branch of this repository's origin.
# Needs VITE_SITE_URL in .env.local (the address the site will have, which also sets the base path)
# and the sprites in src/assets/sprites (they are not in the repository, so the build only works on the author's machine).
set -euo pipefail
cd "$(dirname "$0")/.."

remote="$(git remote get-url origin)"
npm run build
touch dist/.nojekyll

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
cp -R dist/. "$work"
git -C "$work" init -q -b gh-pages
git -C "$work" add -A
git -C "$work" commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%MZ)"
# The branch only holds build output, so each deploy replaces it.
git -C "$work" push -q --force "$remote" gh-pages
echo "Published to gh-pages. Pages serves it from the site address in VITE_SITE_URL."
