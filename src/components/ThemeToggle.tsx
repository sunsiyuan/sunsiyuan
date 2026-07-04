"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  // null until mounted, so server and first client render match (no hydration mismatch)
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute(
      "data-theme"
    ) as Theme | null;
    setTheme(current ?? "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage 不可用（隐私模式等）时忽略，本次会话内切换仍生效
    }
    setTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
      title={isDark ? "浅色模式" : "深色模式"}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full leading-none transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        border: "1px solid var(--rule)",
        color: "var(--ink-faint)",
        fontSize: 13,
      }}
    >
      {/* 显示的是「点一下会切到的目标」：暗色时给太阳，浅色时给月亮 */}
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
    </button>
  );
}
