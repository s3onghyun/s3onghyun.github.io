#!/usr/bin/env bash

# Intentionally manual: this project does not use a GitHub Actions deploy workflow.
set -euo pipefail

project_dir="$(git rev-parse --show-toplevel)"
deploy_dir="$(mktemp -d)"
cleanup() { rm -rf "$deploy_dir"; }
trap cleanup EXIT

cd "$project_dir"
npm run build

remote_url="$(git remote get-url origin)"
git clone --branch gh-pages --single-branch "$remote_url" "$deploy_dir"
rsync -a --delete --exclude .git dist/ "$deploy_dir/"
touch "$deploy_dir/.nojekyll"

git -C "$deploy_dir" add --all
if ! git -C "$deploy_dir" diff --cached --quiet; then
  git -C "$deploy_dir" commit -m "Deploy GitHub Pages"
  git -C "$deploy_dir" push origin HEAD:gh-pages
fi
