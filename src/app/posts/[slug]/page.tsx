import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <article className="max-w-2xl mx-auto px-6 py-12">
      <header className="mb-10">
        <h1 className="font-serif text-3xl leading-tight">{post!.title}</h1>
        <p className="text-xs text-black/40 mt-3 font-mono">{post!.date}</p>
      </header>
      <div className="prose prose-neutral max-w-none prose-p:leading-relaxed prose-headings:font-serif">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post!.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
