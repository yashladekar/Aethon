"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
                h1: ({ children }) => (
                    <h1 className="mb-4 mt-6 text-2xl font-bold first:mt-0">{children}</h1>
                ),
                h2: ({ children }) => (
                    <h2 className="mb-3 mt-6 text-xl font-semibold">{children}</h2>
                ),
                h3: ({ children }) => (
                    <h3 className="mb-2 mt-4 text-lg font-semibold">{children}</h3>
                ),
                p: ({ children }) => (
                    <p className="mb-4 leading-7">{children}</p>
                ),
                ul: ({ children }) => (
                    <ul className="mb-4 ml-6 list-disc">{children}</ul>
                ),
                ol: ({ children }) => (
                    <ol className="mb-4 ml-6 list-decimal">{children}</ol>
                ),
                li: ({ children }) => (
                    <li className="mb-1">{children}</li>
                ),
                code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    if (isInline) {
                        return (
                            <code
                                className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    }
                    return (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
                pre: ({ children }) => (
                    <pre className="mb-4 overflow-x-auto rounded-lg bg-[#0d1117] p-4 text-sm">
                        {children}
                    </pre>
                ),
                a: ({ href, children }) => (
                    <a
                        href={href}
                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {children}
                    </a>
                ),
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
                        {children}
                    </blockquote>
                ),
                hr: () => <hr className="my-6 border-border" />,
                table: ({ children }) => (
                    <div className="mb-4 overflow-x-auto">
                        <table className="w-full border-collapse text-sm">{children}</table>
                    </div>
                ),
                th: ({ children }) => (
                    <th className="border border-border bg-muted px-3 py-2 text-left font-medium">
                        {children}
                    </th>
                ),
                td: ({ children }) => (
                    <td className="border border-border px-3 py-2">{children}</td>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
