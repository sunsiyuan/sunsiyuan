import React from "react";

// Renders **text** as <strong>, `text` as inline <code>, and [text](url) as <a>,
// leaves everything else as plain text.
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      return (
        <code
          key={i}
          className="font-mono"
          style={{
            fontSize: "0.86em",
            background: "var(--paper-raised)",
            color: "var(--ink-soft)",
            padding: "0.1em 0.35em",
            borderRadius: 4,
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent-deep)", textDecoration: "underline" }}
        >
          {label}
        </a>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

const TURN_RE = /^\*\*([^*：]+)：\*\*\s*([\s\S]*)$/;
const HOST_NAMES = new Set(["孙哥"]);

function isAvatarSpeaker(name: string) {
  return !HOST_NAMES.has(name);
}

type Turn = { speaker: string; paragraphs: string[] };

function renderTurn(turn: Turn, key: React.Key) {
  const avatar = isAvatarSpeaker(turn.speaker);
  const labelColor = avatar ? "var(--accent-deep)" : "var(--host-ink)";
  return (
    <div
      key={key}
      className="rounded-lg px-5 py-4 mb-4"
      style={
        avatar
          ? { background: "var(--paper-raised)" }
          : { background: "var(--host-bg)" }
      }
    >
      {turn.paragraphs.map((p, i) => (
        <p
          key={i}
          className="text-[15.5px]"
          style={{
            lineHeight: 1.75,
            marginTop: i === 0 ? 0 : 14,
            marginBottom: 0,
            fontWeight: avatar ? 400 : 500,
          }}
        >
          {i === 0 && (
            <span
              className="font-bold underline decoration-1 underline-offset-2 mr-1"
              style={{ color: labelColor }}
            >
              {turn.speaker}
            </span>
          )}
          {i === 0 && "："}
          {renderInline(p)}
        </p>
      ))}
    </div>
  );
}

// Split into blocks on blank lines, but keep ```fenced``` regions intact
// (a code block may itself contain blank lines).
function splitBlocks(markdown: string): string[] {
  const lines = markdown.split("\n");
  const blocks: string[] = [];
  let buf: string[] = [];
  const flushBuf = () => {
    buf
      .join("\n")
      .split(/\n\n+/)
      .map((b) => b.trim())
      .filter(Boolean)
      .forEach((b) => blocks.push(b));
    buf = [];
  };
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trimStart().startsWith("```")) {
      flushBuf();
      const code = [lines[i]];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        code.push(lines[i]); // closing fence
        i++;
      }
      blocks.push(code.join("\n"));
    } else {
      buf.push(lines[i]);
      i++;
    }
  }
  flushBuf();
  return blocks;
}

export default function InterviewBody({
  markdown,
  format = "interview",
}: {
  markdown: string;
  format?: "interview" | "essay";
}) {
  const blocks = splitBlocks(markdown);

  const elements: React.ReactNode[] = [];
  let currentTurn: Turn | null = null;

  function flush(key: React.Key) {
    if (currentTurn) {
      elements.push(renderTurn(currentTurn, key));
      currentTurn = null;
    }
  }

  blocks.forEach((block, i) => {
    if (block === "---") {
      flush(`flush-${i}`);
      if (format === "essay") {
        // 随笔体：轻分隔，一小截居中细线，不用整条大分割线
        elements.push(
          <hr
            key={i}
            style={{
              width: 40,
              margin: "26px auto",
              border: "none",
              borderTop: "1px solid var(--rule)",
            }}
          />
        );
        return;
      }
      elements.push(
        <hr key={i} className="my-10" style={{ borderColor: "var(--rule)" }} />
      );
      return;
    }

    if (block.startsWith("```")) {
      flush(`flush-${i}`);
      const code = block
        .replace(/^```[^\n]*\n?/, "")
        .replace(/\n?```\s*$/, "");
      elements.push(
        <pre
          key={i}
          className="font-mono rounded-lg px-4 py-3 mb-6 overflow-x-auto"
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            background: "var(--paper-raised)",
            border: "1px solid var(--rule)",
            color: "var(--ink-soft)",
          }}
        >
          <code>{code}</code>
        </pre>
      );
      return;
    }

    // Standalone image block: `![alt](src)` on its own line → <figure>.
    // alt text (if present) doubles as the centered caption below the image.
    {
      const imgMatch = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imgMatch) {
        flush(`flush-${i}`);
        const [, alt, src] = imgMatch;
        elements.push(
          <figure key={i} style={{ margin: "28px 0" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                borderRadius: 8,
                border: "1px solid var(--rule)",
              }}
            />
            {alt && (
              <figcaption
                style={{
                  marginTop: 10,
                  textAlign: "center",
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  color: "var(--ink-faint)",
                }}
              >
                {renderInline(alt)}
              </figcaption>
            )}
          </figure>
        );
        return;
      }
    }

    if (block.startsWith("## ")) {
      flush(`flush-${i}`);
      const raw = block.replace(/^##\s*/, "");
      if (format === "essay") {
        // 随笔体：干净小标题，正体不斜、无引号无边框
        elements.push(
          <h2
            key={i}
            className="font-serif"
            style={{
              fontSize: 21,
              fontWeight: 600,
              lineHeight: 1.35,
              margin: "24px 0 14px",
              color: "var(--ink)",
            }}
          >
            {renderInline(raw)}
          </h2>
        );
        return;
      }
      // 访谈体：金句样式（serif 斜体 + 引号 + 绿边框）
      const title = raw.replace(/^"(.*)"$/, "$1");
      elements.push(
        <h2
          key={i}
          className="font-serif italic pl-4"
          style={{
            fontSize: 22,
            lineHeight: 1.4,
            margin: "48px 0 22px",
            borderLeft: "3px solid var(--accent)",
            color: "var(--accent-deep)",
          }}
        >
          &ldquo;{title}&rdquo;
        </h2>
      );
      return;
    }

    if (block.startsWith("> ")) {
      flush(`flush-${i}`);
      const text = block.replace(/^>\s*/gm, "");
      if (format === "essay") {
        // 随笔体：引用样式（副标题 / 题记 / 文中引用），serif 斜体 + 左边框
        elements.push(
          <blockquote
            key={i}
            className="font-serif italic pl-4 mb-8"
            style={{
              fontSize: 18,
              lineHeight: 1.65,
              color: "var(--ink-soft)",
              borderLeft: "3px solid var(--accent)",
            }}
          >
            {renderInline(text)}
          </blockquote>
        );
        return;
      }
      // 访谈体：绿色披露提示框
      elements.push(
        <div
          key={i}
          className="rounded-lg px-5 py-4 text-sm leading-relaxed mb-10"
          style={{ background: "var(--accent-tint)", color: "var(--accent-deep)" }}
        >
          {renderInline(text)}
        </div>
      );
      return;
    }

    if (block.startsWith("*披露：") || block.startsWith("_披露：")) {
      flush(`flush-${i}`);
      const text = block.replace(/^[*_]|[*_]$/g, "");
      elements.push(
        <div
          key={i}
          className="eyebrow mt-12 leading-relaxed normal-case"
          style={{ color: "var(--ink-faint)", letterSpacing: "normal" }}
        >
          {text}
        </div>
      );
      return;
    }

    // List block: every line is "- x" / "* x" (unordered) or "1. x" / "1 x" (ordered).
    {
      const rows = block.split("\n").map((l) => l.trim()).filter(Boolean);
      const isUL = rows.length >= 1 && rows.every((l) => /^[-*]\s+/.test(l));
      const isOL = rows.length >= 2 && rows.every((l) => /^\d+[.、]?\s+/.test(l));
      if (isUL || isOL) {
        flush(`flush-${i}`);
        const items = rows.map((l) => l.replace(/^([-*]|\d+[.、]?)\s+/, ""));
        const ListTag = isOL ? "ol" : "ul";
        elements.push(
          <ListTag
            key={i}
            className="text-[15.5px] mb-6 pl-6"
            style={{
              lineHeight: 1.8,
              color: "var(--ink)",
              listStyleType: isOL ? "decimal" : "disc",
            }}
          >
            {items.map((it, j) => (
              <li key={j} style={{ marginBottom: 6 }}>
                {renderInline(it)}
              </li>
            ))}
          </ListTag>
        );
        return;
      }
    }

    const match = block.match(TURN_RE);
    if (match) {
      flush(`flush-${i}`);
      const [, speaker, content] = match;
      currentTurn = { speaker, paragraphs: [content] };
      return;
    }

    if (currentTurn) {
      currentTurn.paragraphs.push(block);
      return;
    }

    // Plain narrative paragraph (intro copy, etc.) — only reachable outside a turn.
    // Single newlines inside a paragraph become <br> so the author's own line
    // breaks survive (this renderer is tuned to one writer's raw multi-line style).
    const lines = block.split("\n");

    // Essay "labeled block": first line is a bold label (e.g. a timestamp),
    // rest is the body. Keeps the label tight above its content so a timeline
    // reads as label+body units instead of two evenly-spaced lines.
    if (
      format === "essay" &&
      lines.length >= 2 &&
      /^\*\*[^*]+\*\*/.test(lines[0].trim())
    ) {
      elements.push(
        <div key={i} className="text-[15.5px] mb-6" style={{ color: "var(--ink)" }}>
          <div
            style={{
              lineHeight: 1.5,
              marginBottom: 3,
              color: "var(--accent)",
            }}
          >
            {renderInline(lines[0].replace(/\*\*/g, ""))}
          </div>
          <div style={{ lineHeight: 1.8 }}>
            {lines.slice(1).map((line, k, arr) => (
              <React.Fragment key={k}>
                {renderInline(line)}
                {k < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>
      );
      return;
    }

    elements.push(
      <p
        key={i}
        className="text-[15.5px] mb-6"
        style={{ lineHeight: 1.8, color: "var(--ink)" }}
      >
        {lines.map((line, k) => (
          <React.Fragment key={k}>
            {renderInline(line)}
            {k < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  });

  flush("flush-final");

  return <div>{elements}</div>;
}
