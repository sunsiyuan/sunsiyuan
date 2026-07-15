"""
把站点随笔（format: essay）的 markdown 渲染成微信可粘贴的 HTML。

为什么存在：微信「导入 Markdown」只套它自己的裸样式，且粘贴时会剥离 <style> 标签。
所以像 doocs/md 一样，把每条样式预渲染成元素上的内联 style="..."，粘贴后能存活。
配色用站点自己的暖纸色板（sunsiyuan.xyz），不是通用主题。

这是随笔体版（对照 vibe-podcast/scripts/render_wechat_html.py 的访谈体版）：
干净小标题 / 引用副标题 / 轻分隔 / 绿时间标签块 / 有序无序列表 / 行内代码，全部内联样式。

用法：python3 render_wechat_html.py <input.md> <output.html>
然后：浏览器打开 output.html，全选，复制，粘进公众号编辑器。
"""
import re, sys, html

# 站点色板（globals.css 亮色；微信没有深色模式）
PAPER = "#f1eee6"
PAPER_RAISED = "#f8f6f0"
INK = "#1c1b18"
INK_SOFT = "#5b564c"
INK_FAINT = "#8a8478"
ACCENT = "#2f6f5e"
ACCENT_DEEP = "#1f4a3e"
RULE = "#dad5c8"
SERIF = "Georgia, 'Iowan Old Style', 'Songti SC', 'SimSun', serif"
MONO = "ui-monospace, 'SF Mono', Menlo, monospace"


def render_inline(text):
    text = html.escape(text, quote=False)
    # 行内代码（先于 bold，避免 ** 冲突）
    text = re.sub(
        r"`([^`]+)`",
        rf'<code style="font-family:{MONO};font-size:0.86em;background:{PAPER_RAISED};'
        rf'color:{INK_SOFT};padding:0.1em 0.35em;border-radius:4px;">\1</code>',
        text,
    )
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        rf'<a href="\2" style="color:{ACCENT_DEEP};text-decoration:underline;">\1</a>',
        text,
    )
    return text


def render(md_text):
    blocks = [b.strip() for b in re.split(r"\n\n+", md_text) if b.strip()]
    out = []

    for block in blocks:
        lines = [l for l in block.split("\n")]

        if block == "---":
            out.append(
                f'<hr style="border:none;border-top:1px solid {RULE};'
                f'width:40px;margin:26px auto;" />'
            )
            continue

        if block.startswith("## "):
            title = block[3:].strip()
            out.append(
                f'<h2 style="font-family:{SERIF};font-weight:600;font-size:21px;'
                f'line-height:1.35;margin:26px 0 14px 0;color:{INK};">{render_inline(title)}</h2>'
            )
            continue

        if block.startswith("> "):
            text = re.sub(r"^>\s*", "", block, flags=re.M)
            out.append(
                f'<blockquote style="font-family:{SERIF};font-style:italic;font-size:18px;'
                f'line-height:1.65;color:{INK_SOFT};border-left:3px solid {ACCENT};'
                f'padding-left:16px;margin:0 0 26px 0;">{render_inline(text)}</blockquote>'
            )
            continue

        # 独占一行的图片 ![alt](src) → 居中 figure + 图注（src 用线上绝对地址）
        m_img = re.match(r"^!\[([^\]]*)\]\(([^)]+)\)$", block)
        if m_img:
            alt, src = m_img.group(1), m_img.group(2)
            cap = (
                f'<figcaption style="margin-top:10px;text-align:center;font-size:12.5px;'
                f'line-height:1.6;color:{INK_FAINT};">{render_inline(alt)}</figcaption>'
                if alt else ""
            )
            out.append(
                f'<figure style="margin:26px 0;">'
                f'<img src="{html.escape(src, quote=True)}" alt="{html.escape(alt, quote=True)}" '
                f'style="display:block;width:100%;height:auto;border-radius:8px;'
                f'border:1px solid {RULE};" />{cap}</figure>'
            )
            continue

        rows = [l.strip() for l in lines if l.strip()]
        is_ul = len(rows) >= 1 and all(re.match(r"^[-*]\s+", l) for l in rows)
        is_ol = len(rows) >= 2 and all(re.match(r"^\d+[.、]?\s+", l) for l in rows)
        if is_ul or is_ol:
            tag = "ol" if is_ol else "ul"
            items = [re.sub(r"^([-*]|\d+[.、]?)\s+", "", l) for l in rows]
            lis = "".join(
                f'<li style="margin:0 0 6px 0;">{render_inline(it)}</li>' for it in items
            )
            out.append(
                f'<{tag} style="font-size:15.5px;line-height:1.8;color:{INK};'
                f'padding-left:24px;margin:0 0 20px 0;">{lis}</{tag}>'
            )
            continue

        # 时间标签块：首行是纯 **标签**，下面还有内容 → 绿标签紧贴动作
        if len(lines) >= 2 and re.match(r"^\*\*[^*]+\*\*", lines[0].strip()):
            label = render_inline(lines[0].strip().replace("**", ""))
            body = "<br>".join(render_inline(l) for l in lines[1:])
            out.append(
                f'<p style="margin:0 0 20px 0;font-size:15.5px;color:{INK};">'
                f'<span style="color:{ACCENT};line-height:1.5;">{label}</span><br>'
                f'<span style="line-height:1.8;">{body}</span></p>'
            )
            continue

        if block.startswith("*披露：") or block.startswith("_披露："):
            text = block.strip("*_")
            out.append(
                f'<div style="color:{INK_FAINT};font-size:12.5px;line-height:1.6;'
                f'margin-top:8px;">{html.escape(text)}</div>'
            )
            continue

        # 普通段落（保留段内软换行）
        body = "<br>".join(render_inline(l) for l in lines)
        out.append(
            f'<p style="font-size:15.5px;line-height:1.8;color:{INK};'
            f'margin:0 0 20px 0;">{body}</p>'
        )

    return "\n".join(out)


if __name__ == "__main__":
    in_path, out_path = sys.argv[1], sys.argv[2]
    with open(in_path, encoding="utf-8") as f:
        raw = f.read()

    raw = re.sub(r"^---\n.*?\n---\n", "", raw, count=1, flags=re.S)  # 去 frontmatter
    raw = re.sub(r"^#\s+.*\n+", "", raw, count=1)                    # 去 H1（微信有独立标题栏）

    body_html = render(raw)
    # 微信粘贴净化器偶尔会吃掉第一个节点的内联样式，空行占位吸收这个损失
    spacer = '<p style="margin:0;padding:0;">&nbsp;</p>'
    doc = f"""<!doctype html>
<html><head><meta charset="utf-8"></head>
<body style="background:{PAPER};padding:24px;max-width:640px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;">
{spacer}
{body_html}
</body></html>"""

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(doc)
    print(f"Wrote {out_path}")
