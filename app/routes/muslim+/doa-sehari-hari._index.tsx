import React from "react";
import { Button, buttonVariants } from "#app/components/ui/button";
import { ClientOnly } from "remix-utils/client-only";
import Loader from "#app/components/ui/loader";
import { Badge } from "#app/components/ui/badge";
import { cn } from "#app/utils/misc.tsx";
import { useRouteLoaderData, useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { BookOpen, ChevronLeft } from "lucide-react";
import { data as data_doa } from "#app/constants/doa-sehari-hari.ts";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import { fontSizeOpt } from "#/app/constants/prefs";
import { useVirtualizer } from "@tanstack/react-virtual";

import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "Doa Sehari-hari | Doti App" },
];

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

export async function loader() {
  return json(data_doa, {
    headers: {
      "Cache-Control": "public, max-age=31560000",
    },
  });
}

function App() {
  const loaderData = useLoaderData();
  const loaderRoot = useRouteLoaderData("root");
  const opts = loaderRoot?.opts || {};
  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: loaderData.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 35,
  });
  return (
    <div className="w-full max-w-xl mx-auto border-x">
      <div className="px-1.5 pt-2.5 pb-2 flex justify-between gap-x-3 sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center gap-x-2">
          <Link
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
              "prose-none [&_svg]:size-6 bg-transparent",
            )}
            to="/muslim"
          >
            <ChevronLeft />
          </Link>
          <span className="text-lg font-semibold capitalize">
            Do'a Sehari-hari
          </span>
        </div>

        <DisplaySetting />
      </div>
      <div
        ref={parentRef}
        style={{
          overflow: "auto",
        }}
        className="h-[calc(100vh-57px)] prose dark:prose-invert max-w-4xl mx-auto border-x"
      >
        <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3">
          Do'a Sehari-hari
        </div>
        <div className="w-fit mx-auto -mt-3">
          <Link
            className="text-sm"
            to="https://gist.github.com/autotrof/172eb06313bebaefbc88ec1b04da4fef"
            target="_blank"
          >
            Source data
          </Link>
        </div>

        <div>
          <div
            className="space-y-0.5 py-2"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const dt = loaderData[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="border-t" key={dt.id}>
                    <div
                      className={cn(
                        "group relative py-4 px-4 sm:px-5 md:border-t",
                      )}
                    >
                      <div className="w-full text-right flex gap-x-2.5 items-center justify-between">
                        <div className="flex items-center gap-x-3">
                          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 p-3 rounded-xl">
                            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="grid text-left gap-0.5">
                            <span className="text-lg font-medium">
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
                        <div
                          className={cn(
                            "relative text-right text-primary my-5 font-lpmq",
                          )}
                          style={{
                            fontWeight: opts.font_weight,
                            fontSize: font_size_opts?.fontSize || "1.5rem",
                            lineHeight: font_size_opts?.lineHeight || "3.5rem",
                          }}
                        >
                          {dt.arab}
                        </div>
                      </div>

                      {opts?.font_latin === "on" && (
                        <div
                          className="latin-text prose max-w-none text-muted-foreground leading-6"
                          dangerouslySetInnerHTML={{
                            __html: dt.latin,
                          }}
                        />
                      )}

                      {opts?.font_translation === "on" && (
                        <div
                          className="translation-text mt-3 prose max-w-none text-accent-foreground leading-6"
                          dangerouslySetInnerHTML={{
                            __html: dt.arti,
                          }}
                        />
                      )}

                      {dt.footnote && (
                        <div className="note-text mt-3">
                          <div
                            className="border-l-2 max-w-none prose text-accent-foreground ml-1.5 italic text-muted-foreground px-2.5 text-sm"
                            dangerouslySetInnerHTML={{
                              __html: dt.footnote,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Route() {
  return <ClientOnly fallback={<Loader />}>{() => <App />}</ClientOnly>;
}
