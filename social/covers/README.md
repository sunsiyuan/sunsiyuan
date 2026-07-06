# 封面模版（小红书 750×1000）

暖纸风个人封面，视觉跟站点一致（`src/app/globals.css` 色板）。
**原则：营销只出现在封面 + 标题；正文永远是原文，不营销化。**

## 出一张新封面

```bash
cp _template.html <slug>-cover.html      # 复制模版
# 编辑 <slug>-cover.html 的「编辑区」：eyebrow / 标题 / 高亮词 / 副标题 / 落款
./render.sh <slug>-cover.html            # 生成 <slug>-cover.png（1500×2000, 2x）
```

## 全部重渲染

```bash
./render.sh
```

## 结构

- `cover.css` — 所有封面共用样式（改这一处，全部封面统一）
- `_template.html` — 空模版（`_` 开头，`render.sh` 会跳过）
- `<slug>-cover.html` / `.png` — 每篇一张
- `render.sh` — headless Chrome 截图流水线

## 可调的样式旋钮（都在 `cover.css`）

- 标题字号 `.title { font-size }`（中文标题一般 2 行最好看）
- 高亮色 / eyebrow / 落款颜色 = 站点绿 `#2f6f5e`、次墨 `#5b564c`、淡墨 `#8a8478`
- 想换版式（加图形元素 / 图上文下等）：新开一个 `_template-xxx.html` 存不同布局

## 依赖

Google Chrome（macOS）、python3。参考自 `hongqiao-ops` 的 `xianyu-covers/render.sh`。
