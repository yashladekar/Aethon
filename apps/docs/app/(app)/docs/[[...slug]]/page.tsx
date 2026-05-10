import { notFound } from "next/navigation";

import { getTopicBySlug } from "@aethon/content-core";

import { MDXRenderer } from "@/components/mdx-renderer";

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  const topic = await getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-10">
        <p className="text-sm text-muted-foreground mb-2">
          {topic.frontmatter.difficulty}
        </p>

        <h1 className="text-5xl font-bold mb-4">
          {topic.frontmatter.title}
        </h1>

        <p className="text-lg text-muted-foreground">
          {topic.frontmatter.description}
        </p>
      </div>

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <MDXRenderer source={topic.content} />
      </article>
    </div>
  );
}