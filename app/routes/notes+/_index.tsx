import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";

import { getPosts } from "#app/utils/posts.server";
import { Post } from "#app/components/post";

export const loader = async () => json(await getPosts());

export default function Component() {
  const posts = useLoaderData<typeof loader>();

  return (
    <div className="relative divide-y-2 divide-gray-200">
      <div className="grid gap-5 lg:grid-cols-2">
        {posts.map((post) => (
          <React.Fragment key={post.slug}>
            <Post {...post} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
