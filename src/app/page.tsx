import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <p className="text-sm text-black/60 mb-10 leading-relaxed">
        内容创作者，「孙哥火星殖民计划」。这里放长文、播客文字版和一些不成熟的想法。
      </p>
      <ul className="space-y-8">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`} className="group block">
              <h2 className="font-serif text-xl group-hover:underline">
                {post.title}
              </h2>
              <p className="text-sm text-black/60 mt-1">{post.description}</p>
              <p className="text-xs text-black/40 mt-2 font-mono">
                {post.date}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
