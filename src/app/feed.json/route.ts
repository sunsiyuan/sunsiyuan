import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

// JSON Feed 1.1 —— 对 agent / 脚本最好解析的一种「订阅源」，item 里带全文。
export const dynamic = "force-static";

function isoDate(date: string): string | undefined {
  const d = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function GET(): Response {
  const posts = getAllPosts();

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: SITE_NAME,
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    description: SITE_DESCRIPTION,
    language: "zh-CN",
    items: posts.map((p) => {
      const url = `${SITE_URL}/posts/${p.slug}`;
      const published = isoDate(p.date);
      return {
        id: url,
        url,
        title: p.title,
        summary: p.description,
        // 全文（原始 markdown），方便 agent 直接取用而不必再抓页面。
        content_text: getPostBySlug(p.slug).content,
        ...(published ? { date_published: published } : {}),
        tags: p.tags,
      };
    }),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { "Content-Type": "application/feed+json; charset=utf-8" },
  });
}
