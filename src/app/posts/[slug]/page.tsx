import type { Metadata } from "next";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import InterviewBody from "@/components/InterviewBody";
import Subscribe from "@/components/Subscribe";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `https://sunsiyuan.xyz/posts/${slug}`,
      publishedTime: post.date || undefined,
      tags: post.tags,
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.description,
    },
  };
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
      <header
        className="mb-10 pb-8"
        style={{ borderBottom: "1px solid var(--rule)" }}
      >
        <div className="eyebrow mb-2">孙哥火星殖民计划</div>
        <h1
          className="font-serif"
          style={{ fontSize: 34, fontWeight: 400, lineHeight: 1.25, margin: "8px 0 12px" }}
        >
          {post!.title}
        </h1>
        <p className="eyebrow" style={{ color: "var(--ink-faint)" }}>
          {post!.date}
        </p>
      </header>
      <InterviewBody markdown={post!.content} />
      <div className="mt-16">
        <Subscribe />
      </div>
    </article>
  );
}
