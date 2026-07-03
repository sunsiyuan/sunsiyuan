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
      <body className="min-h-full flex flex-col bg-[#f5f3ee] text-[#1c1b18]">
        <header className="border-b border-black/10">
          <div className="max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
            <Link href="/" className="font-serif text-lg tracking-tight">
              孙思远
            </Link>
            <nav className="text-sm text-black/60 space-x-4">
              <Link href="/" className="hover:text-black">
                文章
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-black/10 mt-16">
          <div className="max-w-2xl mx-auto px-6 py-8 text-xs text-black/40">
            © {new Date().getFullYear()} 孙思远
          </div>
        </footer>
      </body>
    </html>
  );
}
