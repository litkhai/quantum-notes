#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${CLICKHOUSE_HOST:-}" ]]; then
  echo "Set CLICKHOUSE_HOST to your ClickHouse Cloud hostname." >&2
  exit 2
fi

QUANTUM_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QUANTUM_REPO_DIR="$(cd "${QUANTUM_SCRIPT_DIR}/.." && pwd)"
QUANTUM_PYTHON_BIN="${QUANTUM_PYTHON_BIN:-python3}"

cd "${QUANTUM_REPO_DIR}"

export CLICKHOUSE_PORT="${CLICKHOUSE_PORT:-8443}"
export CLICKHOUSE_SECURE="${CLICKHOUSE_SECURE:-true}"
export CLICKHOUSE_USERNAME="${CLICKHOUSE_USERNAME:-default}"

exec "${QUANTUM_PYTHON_BIN}" -m simulations.clickhouse_demo \
  --load-clickhouse \
  --database quantum \
  --create-database \
  --password-prompt \
  "$@"
