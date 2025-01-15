import { DisplaySetting } from "#app/routes/resources+/prefs";
import { ScrollToFirstIndex } from "#app/components/custom/scroll-to-top.tsx";
import { Heart, ArrowUp, ChevronLeft } from "lucide-react";
import { Button, buttonVariants } from "#app/components/ui/button";
import { ClientOnly } from "remix-utils/client-only";
import Loader from "#app/components/ui/loader";
import { useLoaderData, Link } from "@remix-run/react";
import ky from "ky";
import { json } from "@remix-run/node";
import { cn } from "#app/utils/misc.tsx";

import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Doa | Doti App" }];

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

const sumber = [
  "quran",
  "hadits",
  "pilihan",
  "harian",
  "ibadah",
  "haji",
  "lainnya",
];

export async function loader({ params }) {
  const { source } = params;
  if (!sumber.includes(source)) {
    throw new Error("404: Source not found");
  }
  const api = ky.create({ prefixUrl: "https://api.myquran.com/v2/doa/sumber" });
  const data = await api.get(source).json();

  if (!data.status) {
    throw new Response("Not Found", { status: 404 });
  }
  const _data = {
    label: data.request.path.replace(/\//g, " ").replace(/sumber/gi, ""), // Ganti '/' dengan spasi
    source: data.request.path.replace(/\//g, " ").trim().split(" ").pop(),
    data: data.data,
  };
  return json(_data, {
    headers: {
      "Cache-Control": "public, max-age=31560000",
    },
  });
}

const BOOKMARK_KEY = "BOOKMARK";

function Doa() {
  const loaderData = useLoaderData();

  return (
    <React.Fragment>
      <div className="h-screen w-full max-w-xl mx-auto border-x">
        <div className="px-1.5 pt-2.5 pb-2 flex justify-between gap-x-3 sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <div className="flex items-center gap-x-2">
            <Link
              className={cn(
                buttonVariants({ size: "icon", variant: "outline" }),
                "prose-none [&_svg]:size-6 bg-transparent",
              )}
              to="/muslim/doa"
            >
              <ChevronLeft />
            </Link>
            <span className="text-lg font-semibold capitalize">
              Do'a {loaderData.source}
            </span>
          </div>

          <DisplaySetting />
        </div>

        <DoaView source={loaderData.source} items={loaderData.data}>
          <div className="text-center p-2 border-b">
            <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize">
              Do'a {loaderData.source}
            </div>
            <p className="text-muted-foreground">
              Kumpulan do'a {loaderData.source === "pilihan" ? "" : "dari"}{" "}
              {loaderData.source}
            </p>
          </div>
        </DoaView>
      </div>
    </React.Fragment>
  );
}

import { get_cache, set_cache } from "#app/utils/cache-client.ts";
import { save_bookmarks, type Bookmark } from "#app/utils/bookmarks";

import React from "react";
import { motion, useSpring, useScroll } from "framer-motion";

const DoaView = ({ items, children }) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);

  React.useEffect(() => {
    const load_bookmark_from_lf = async () => {
      const storedBookmarks = await get_cache(BOOKMARK_KEY);
      if (storedBookmarks) {
        setBookmarks(storedBookmarks);
      }
    };

    load_bookmark_from_lf();
  }, []);

  const bookmarks_ayah = bookmarks
    .filter((item) => item.type === "doa")
    .map((item) => {
      const params = new URLSearchParams(item.source.split("?")[1]);
      return {
        created_at: item.created_at,
        id: params.get("index"),
        source: item.source,
      }; // Ambil nilai "ayat"
    });

  const toggleBookmark = (doa) => {
    const newBookmarks = save_bookmarks(
      "doa",
      {
        title: doa.judul,
        arab: doa.arab,
        latin: null,
        tafsir: null,
        translation: doa.indo,
        source: `/muslim/doa?index=${doa.index}&source=${doa.source}`,
      },
      [...bookmarks],
    );

    const is_saved = bookmarks_ayah.find((fav) => fav.id === doa.index);

    if (is_saved) {
      const newBookmarks = bookmarks?.filter(
        (d) => d.created_at !== is_saved.created_at,
      );
      setBookmarks(newBookmarks);
    } else {
      setBookmarks(newBookmarks);
    }
  };

  React.useEffect(() => {
    const save_bookmark_to_lf = async (bookmarks) => {
      await set_cache(BOOKMARK_KEY, bookmarks);
    };
    save_bookmark_to_lf(bookmarks);
  }, [bookmarks]);

  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 35,
  });

  const { scrollYProgress } = useScroll({
    container: parentRef,
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const scrollToFirstAyat = () => {
    rowVirtualizer.scrollToIndex(0, {
      align: "center",
    });
  };

  return (
    <React.Fragment>
      <motion.div
        className="z-[60] bg-gradient-to-r from-fuchsia-500 to-cyan-500 dark:from-fuchsia-400 dark:to-cyan-400 max-w-xl mx-auto"
        style={{
          scaleX,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          originX: 0,
        }}
      />
      <div
        ref={parentRef}
        className="h-[calc(100vh-55px)]"
        style={{
          overflowAnchor: "none",
          overflow: "auto",
          position: "relative",
          contain: "strict",
        }}
      >
        <div
          className="py-2"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {children && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(0px)`,
                paddingBottom: "1px",
              }}
            >
              {children}
            </div>
          )}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const d = items[virtualRow.index];
            const doa = {
              ...d,
              index: virtualRow.index.toString(),
            };

            const _source = `/muslim/doa?index=${doa.index}&source=${doa.source}`;

            const isFavorite = bookmarks_ayah.some(
              (fav) => fav.source === _source,
            );
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
                  transform: `translateY(${virtualRow.start + (children ? 79 : 0)}px)`, // Tambahkan offset untuk children
                }}
              >
                <div key={virtualRow.index} className="w-full border-b pb-5">
                  <div className="group relative w-full">
                    <div
                      className={cn(
                        "flex items-center justify-between gap-x-2 mb-2 border-b py-2.5 px-4 bg-gradient-to-br from-muted/20 to-accent/20",
                        isFavorite &&
                          "from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20",
                      )}
                    >
                      <div className="text-primary font-medium text-lg line-clamp-1">
                        {doa.judul}
                      </div>

                      <button
                        onClick={() => toggleBookmark(doa)}
                        className={cn(
                          "flex-none  bg-gradient-to-br from-muted to-accent size-9 [&_svg]:size-5 inline-flex gap-2 items-center justify-center rounded-lg",
                          isFavorite &&
                            "from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20",
                        )}
                      >
                        <Heart
                          className={cn(
                            "text-muted-foreground",
                            isFavorite && "text-rose-600 dark:text-rose-400",
                          )}
                        />
                      </button>
                    </div>

                    <div className="w-full px-4 text-right flex gap-x-2.5 items-start justify-end">
                      <p
                        className="relative mt-2 font-lpmq text-right text-primary"
                        dangerouslySetInnerHTML={{
                          __html: doa.arab,
                        }}
                      />
                    </div>
                    <div className="mt-3 space-y-3 px-4">
                      <div
                        className="translation-text prose leading-6 max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: doa.indo,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ScrollToFirstIndex
        handler={scrollToFirstAyat}
        container={parentRef}
        className="bottom-3"
      />
    </React.Fragment>
  );
};

import { useVirtualizer } from "@tanstack/react-virtual";

export default function Route() {
  return <ClientOnly fallback={<Loader />}>{() => <Doa />}</ClientOnly>;
}
