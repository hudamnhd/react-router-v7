import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";

import { getPosts } from "#app/utils/posts.server";
import { Post } from "#app/components/post";

export const loader = async () => json(await getPosts());

export default function Component() {
  const posts = useLoaderData<typeof loader>();

  return (
    <div className="pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
      <div className="relative max-w-lg mx-auto divide-y-2 divide-gray-200 lg:max-w-7xl">
        <div className="mt-6 pt-10 grid gap-16 lg:grid-cols-2 lg:gap-x-5 lg:gap-y-12">
          {posts.map((post) => (
            <React.Fragment key={post.slug}>
              <Post {...post} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
