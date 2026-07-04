import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
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

const SITE_NAME = "孙思远 / Miles Sun";
const SITE_DESCRIPTION = "孙思远的个人网站——博客、播客文字版与一些不成熟的想法。";

export const metadata: Metadata = {
  metadataBase: new URL("https://sunsiyuan.xyz"),
  title: {
    default: SITE_NAME,
    template: "%s · 孙思远",
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: "孙思远", url: "https://sunsiyuan.xyz" }],
  creator: "孙思远",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://sunsiyuan.xyz",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
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
            className="max-w-2xl mx-auto px-6 py-8 eyebrow"
            style={{ color: "var(--ink-faint)" }}
          >
            © {new Date().getFullYear()} 孙思远
          </div>
        </footer>
      </body>
    </html>
  );
}
