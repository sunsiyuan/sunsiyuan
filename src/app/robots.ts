import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// 明确允许所有爬虫（含 GPTBot / ClaudeBot 等 AI 抓取器）——
// 目标就是让内容尽量被 agent/模型发现和引用，不做限制。
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
