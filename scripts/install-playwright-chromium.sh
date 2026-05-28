#!/usr/bin/env bash
# 在本机终端运行（勿依赖 Agent 沙箱）：安装 Playwright Chromium 并清理陈旧 __dirlock
set -euo pipefail
cd "$(dirname "$0")/.."

LOCK_CANDIDATES=(
  "${TMPDIR:-/tmp}/cursor-sandbox-cache"/*/playwright/__dirlock
  "${HOME}/Library/Caches/ms-playwright/__dirlock"
)
for lock in "${LOCK_CANDIDATES[@]}"; do
  for f in $lock; do
    [[ -e "$f" ]] && rm -rf "$f" && echo "[install-playwright] removed lock: $f"
  done
done

# 强制使用用户目录，避免 Cursor Agent 注入的沙箱 PLAYWRIGHT_BROWSERS_PATH
unset PLAYWRIGHT_DOWNLOAD_HOST
export PLAYWRIGHT_BROWSERS_PATH="${HOME}/Library/Caches/ms-playwright"
mkdir -p "$PLAYWRIGHT_BROWSERS_PATH"
echo "[install-playwright] PLAYWRIGHT_BROWSERS_PATH=$PLAYWRIGHT_BROWSERS_PATH"
npx playwright install chromium
echo "[install-playwright] done. Run: npm run test:e2e"
