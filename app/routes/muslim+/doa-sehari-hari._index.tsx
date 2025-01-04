import React from "react";
import { ClientOnly } from "remix-utils/client-only";
import Loader from "#app/components/ui/loader";
import { Badge } from "#app/components/ui/badge";
import { cn } from "#app/utils/misc.tsx";
import { useRouteLoaderData, useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { BookOpen } from "lucide-react";
import { data as data_doa } from "#app/constants/doa-sehari-hari.ts";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import { fontSizeOpt } from "#/app/constants/prefs";
import { useVirtualizer } from "@tanstack/react-virtual";

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
    <div
      ref={parentRef}
      style={{
        overflow: "auto",
      }}
      className="h-[calc(100vh-57px)] prose dark:prose-invert max-w-4xl mx-auto border-x"
    >
      <div className="p-1.5 flex justify-end">
        <DisplaySetting opts={opts} />
      </div>
      <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize border-t py-3">
        Do'a Sehari-hari
      </div>
      <div className="w-fit mx-auto">
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
                        className="latin-text prose max-w-none text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html: dt.latin,
                        }}
                      />
                    )}

                    {opts?.font_translation === "on" && (
                      <div
                        className="translation-text mt-3 prose max-w-none text-accent-foreground italic"
                        dangerouslySetInnerHTML={{
                          __html: dt.arti,
                        }}
                      />
                    )}

                    {dt.footnote && (
                      <div className="note-text">
                        <details
                          className="group [&_summary::-webkit-details-marker]:hidden"
                          open
                        >
                          <summary className="flex cursor-pointer items-center justify-start gap-1.5  px-2.5 py-2">
                            <span className="font-medium text-sm text-muted-foreground">
                              <span className="group-open:hidden inline">
                                Show
                              </span>
                              <span className="group-open:inline hidden">
                                Hide
                              </span>{" "}
                              Footnote
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="size-5 shrink-0 transition duration-300 group-open:-rotate-45 text-muted-foreground"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </summary>

                          <div
                            className="border-l-2 max-w-none prose text-accent-foreground ml-3 italic text-muted-foreground px-2.5 text-sm"
                            dangerouslySetInnerHTML={{
                              __html: dt.footnote,
                            }}
                          />
                        </details>
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
  );
}

export default function Route() {
  return <ClientOnly fallback={<Loader />}>{() => <App />}</ClientOnly>;
}
