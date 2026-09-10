#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT"

for package in api admin img; do
  npm ci --no-audit --no-fund --prefix "$ROOT/$package"
done

(cd "$ROOT/email" && npm install --no-audit --no-fund --legacy-peer-deps)

npm test

"$ROOT/email/node_modules/.bin/tsc" --noEmit --pretty false -p "$ROOT/email/tsconfig.json"

npm run build --prefix "$ROOT/admin"
npm run build --prefix "$ROOT/img"