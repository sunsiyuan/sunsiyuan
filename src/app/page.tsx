import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <div className="eyebrow mb-3">孙哥火星殖民计划</div>
      <p
        className="text-sm mb-12 leading-relaxed"
        style={{ color: "var(--ink-soft)" }}
      >
        内容创作者。这里放长文、播客文字版和一些不成熟的想法。
      </p>
      <ul className="space-y-10">
        {posts.map((post) => (
          <li
            key={post.slug}
            style={{ borderLeft: "3px solid var(--accent)", paddingLeft: 16 }}
          >
            <Link href={`/posts/${post.slug}`} className="group block">
              <h2 className="font-serif text-xl leading-snug group-hover:underline">
                {post.title}
              </h2>
              <p
                className="text-sm mt-1.5"
                style={{ color: "var(--ink-soft)" }}
              >
                {post.description}
              </p>
              <p className="eyebrow mt-2.5" style={{ color: "var(--ink-faint)" }}>
                {post.date}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
