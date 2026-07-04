import { getAllPosts } from "@/lib/posts";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_TWITTER,
  SITE_TWITTER_URL,
} from "@/lib/site";

// llms.txt —— 给 LLM/agent 的站点索引（https://llmstxt.org/），
// 让别人问到你时，模型能干净地发现并引用你的内容。
export const dynamic = "force-static";

export function GET(): Response {
  const posts = getAllPosts();

  const articleList = posts
    .map(
      (p) =>
        `- [${p.title}](${SITE_URL}/posts/${p.slug}): ${p.description}${
          p.date ? `（${p.date}）` : ""
        }`
    )
    .join("\n");

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

孙思远（Miles Sun）是一名内容创作者。本站收录他的长文、播客文字版和个人思考，
第一个系列是「孙哥火星殖民计划」Vibe Podcast 的嘉宾专访（访谈体，中文）。

## 文章

${articleList}

## 订阅源

- [RSS](${SITE_URL}/feed.xml): 标准 RSS 2.0
- [JSON Feed](${SITE_URL}/feed.json): 含全文，适合 agent/脚本
- [Sitemap](${SITE_URL}/sitemap.xml)

## 社交

- X / Twitter: [${SITE_TWITTER}](${SITE_TWITTER_URL})
- 微信公众号: 真的孙思远
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
