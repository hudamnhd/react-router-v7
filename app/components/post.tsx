import { Link } from "@remix-run/react";

import type { PostMeta } from "~/lib/posts.server";

export const Post = ({ slug, frontmatter }: PostMeta) => {
  return (
    <article className="space-y-2">
      <Link to={`/notes/${slug}`}>
        <div className="text-3xl font-bold">{frontmatter.title}</div>
      </Link>
      <p className="text-accent-foreground">{frontmatter.description}</p>
      <time
        className="text-muted-foreground block text-sm font-medium"
        dateTime={frontmatter.published}
      >
        {frontmatter.published.replace(/-/g, "/")}
      </time>
    </article>
  );
};
