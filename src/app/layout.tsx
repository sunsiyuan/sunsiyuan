import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "孙思远 / Miles Sun",
  description: "孙思远的个人网站——博客、播客与思考",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header style={{ borderBottom: "1px solid var(--rule)" }}>
          <div className="max-w-2xl mx-auto px-6 py-8 flex items-center justify-between">
            <Link href="/" className="font-serif text-xl tracking-tight">
              孙思远
            </Link>
            <nav
              className="eyebrow space-x-4"
              style={{ color: "var(--ink-faint)" }}
            >
              <Link href="/" className="hover:underline">
                文章
              </Link>
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
