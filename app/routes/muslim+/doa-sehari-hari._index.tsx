import { Badge } from "#app/components/ui/badge";
import { cn } from "#app/utils/misc.tsx";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { json, type ClientLoaderFunctionArgs } from "@remix-run/node";
import {
  BookOpen,
  Scroll,
  CheckCircle,
  Circle,
  Heart,
  MapPin,
} from "lucide-react";
import { data as data_doa } from "#app/constants/doa-sehari-hari.ts";

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

export async function loader() {
  // Validasi respons
  // Gabungkan data
  return json(data_doa, {
    headers: {
      "Cache-Control": "public, max-age=31560000",
    },
  });
}

import { getCache, setCache, constructKey } from "#app/utils/cache-client.ts";

export async function clientLoader({
  request,
  serverLoader,
}: ClientLoaderFunctionArgs) {
  const key = constructKey(request);

  const cachedData = await getCache(key);

  if (cachedData) {
    return cachedData; // (3)
  }

  const serverData = await serverLoader();
  await setCache(key, serverData);
  return serverData;
}

clientLoader.hydrate = true;

export default function Route() {
  const loaderData = useLoaderData();

  return (
    <React.Fragment>
      <div className="prose dark:prose-invert max-w-4xl mx-auto border-x">
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize my-2">
          Do'a Sehari-hari
        </h1>
        <div className="w-fit mx-auto mb-2">
          <a href="https://gist.github.com/autotrof/172eb06313bebaefbc88ec1b04da4fef">
            Source data
          </a>
        </div>
        <div className="">
          {loaderData.map((dt) => {
            return (
              <div className="border-t" key={dt.id}>
                <div
                  className={cn("group relative py-4 px-4 sm:px-5 md:border-t")}
                >
                  <div className="w-full text-right flex gap-x-2.5 items-center justify-between">
                    <div className="flex items-center gap-x-3">
                      <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 p-3 rounded-xl">
                        <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="grid text-left gap-1">
                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                          {dt.judul}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {dt.tag.map((tag) => (
                            <Badge
                              variant="outline"
                              className="text-xs"
                              key={tag}
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full text-right flex gap-x-2.5 items-end justify-end">
                    <div className="relative font-lpmq text-right text-primary my-5">
                      {dt.arab}
                    </div>
                  </div>
                  <div className="translation-text">
                    <div
                      className="max-w-none prose-normal duration-300 text-muted-foreground mb-2"
                      dangerouslySetInnerHTML={{
                        __html: dt.latin,
                      }}
                    />
                  </div>
                  <div className="translation-text">
                    <div
                      className="max-w-none prose text-accent-foreground"
                      dangerouslySetInnerHTML={{
                        __html: dt.arti,
                      }}
                    />
                  </div>
                  {dt.footnote && (
                    <div className="note-text">
                      <div
                        className="border-l-2 pl-2 max-w-none prose text-accent-foreground mt-2 italic text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html: dt.footnote,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
}
