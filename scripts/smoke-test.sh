#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE_URL:-http://localhost:3000}"
echo "Health:"
curl -fsS "$BASE/api/health"
echo
echo "Customer verify:"
curl -fsS -X POST "$BASE/api/customer/verify" -H 'content-type: application/json' -d '{"orderNumber":"DEMO-2026-0001","customerName":"김민준"}'
echo
