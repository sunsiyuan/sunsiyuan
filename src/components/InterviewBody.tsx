import React from "react";

// Renders **text** as <strong> and [text](url) as <a>, leaves everything else as plain text.
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
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

export default function InterviewBody({ markdown }: { markdown: string }) {
  const blocks = markdown
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

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
      elements.push(
        <hr key={i} className="my-10" style={{ borderColor: "var(--rule)" }} />
      );
      return;
    }

    if (block.startsWith("## ")) {
      flush(`flush-${i}`);
      const title = block.replace(/^##\s*/, "").replace(/^"(.*)"$/, "$1");
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
    elements.push(
      <p
        key={i}
        className="text-[15.5px] mb-6"
        style={{ lineHeight: 1.8, color: "var(--ink)" }}
      >
        {renderInline(block)}
      </p>
    );
  });

  flush("flush-final");

  return <div>{elements}</div>;
}
