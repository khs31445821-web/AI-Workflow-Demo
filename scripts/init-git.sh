#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -d .git ]; then
  echo "Already a git repository."
  exit 0
fi
git init
git add .
git commit -m "Initial clean-room assurance workflow demo"
echo "Git repository initialized. Add a remote only after reviewing PORTFOLIO_BOUNDARY.md."
