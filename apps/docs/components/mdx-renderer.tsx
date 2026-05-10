import { MDXRemote } from "next-mdx-remote/rsc";

import { mdxComponents } from "./mdx-components";

export function MDXRenderer({
  source,
}: {
  source: string;
}) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
    />
  );
}