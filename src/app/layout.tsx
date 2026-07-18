import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import ThemeToggle from "@/components/ThemeToggle";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_TWITTER,
  SITE_TWITTER_URL,
} from "@/lib/site";
import "./globals.css";

// 首屏渲染前同步定好主题，避免刷新时先闪一下浅色（no-flash）。
// 未存偏好时跟随系统 prefers-color-scheme。
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s · 孙思远",
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: "孙思远", url: SITE_URL }],
  creator: "孙思远",
  alternates: {
    canonical: "/",
    types: {
      // 让浏览器/阅读器自动发现订阅源
      "application/rss+xml": [{ url: "/feed.xml", title: SITE_NAME }],
      "application/feed+json": [{ url: "/feed.json", title: SITE_NAME }],
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    site: SITE_TWITTER,
    creator: SITE_TWITTER,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <header style={{ borderBottom: "1px solid var(--rule)" }}>
          <div className="max-w-2xl mx-auto px-6 py-8 flex items-center justify-between">
            <Link href="/" className="font-serif text-xl tracking-tight">
              孙思远
            </Link>
            <nav
              className="eyebrow flex items-center gap-4"
              style={{ color: "var(--ink-faint)" }}
            >
              <Link href="/" className="hover:underline">
                文章
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer style={{ borderTop: "1px solid var(--rule)", marginTop: 64 }}>
          <div
            className="max-w-2xl mx-auto px-6 py-8 eyebrow flex flex-wrap items-center justify-between gap-4"
            style={{ color: "var(--ink-faint)" }}
          >
            <span className="flex items-center gap-3">
              <span>© {new Date().getFullYear()} 孙思远</span>
              <a
                href={SITE_TWITTER_URL}
                target="_blank"
                rel="me noopener noreferrer"
                className="hover:underline"
                aria-label={`X（${SITE_TWITTER}）`}
              >
                X
              </a>
            </span>
            <span className="flex items-center gap-4">
              <span aria-hidden="true" style={{ textTransform: "none" }}>
                订阅
              </span>
              <a href="/feed.xml" className="hover:underline">
                RSS
              </a>
              <a href="/feed.json" className="hover:underline">
                JSON
              </a>
              <a href="/llms.txt" className="hover:underline">
                llms.txt
              </a>
            </span>
          </div>
        </footer>
        {/* Cloudflare Web Analytics（灰云 DNS-only，必须手动注入 beacon） */}
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon='{"token": "0cb386a70734487e94138b96e63a38ef"}'
        />
        <Analytics />
      </body>
    </html>
  );
}
