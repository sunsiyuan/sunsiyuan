#!/usr/bin/env bash
# 把封面 HTML 渲染成 750×1000 的 PNG（2x = 1500×2000），小红书封面尺寸。
# 用法：
#   ./render.sh                       # 渲染目录下所有 *.html（跳过 _ 开头的模版）
#   ./render.sh ssh-breach-cover.html # 只渲染一张
# 输出：跟 HTML 同名的 .png，放在同目录。
# 依赖：Google Chrome（macOS）、python3。
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT=8172
[ -x "$CHROME" ] || { echo "找不到 Chrome：$CHROME"; exit 1; }

cd "$DIR"
# 本地起个静态服务（这样 <link href="cover.css"> 能加载）
pkill -f "http.server $PORT" 2>/dev/null || true
sleep 0.3
python3 -m http.server "$PORT" >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
sleep 1

render_one() {
  local html="$1"
  local base="${html%.html}"
  "$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
    --screenshot="$DIR/$base.png" \
    --window-size=750,1000 --force-device-scale-factor=2 \
    "http://localhost:$PORT/$html" 2>/dev/null
  echo "  ✓ $html → $base.png"
}

if [ -n "$1" ]; then
  render_one "$(basename "$1")"
else
  for f in *.html; do
    [ -f "$f" ] || continue
    case "$f" in _*) continue ;; esac
    render_one "$f"
  done
fi

echo "完成 → $DIR"
