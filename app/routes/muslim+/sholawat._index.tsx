import data from "#/app/constants/sholawat";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import { useRouteLoaderData } from "@remix-run/react";
import { fontSizeOpt } from "#/app/constants/prefs";
import { cn } from "#app/utils/misc.tsx";
import { get_cache, set_cache } from "#app/utils/cache-client.ts";
import { save_bookmarks, type Bookmark } from "#app/utils/bookmarks";
import React from "react";
import { Heart } from "lucide-react";

import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Sholawat | Doti App" }];

const BOOKMARK_KEY = "BOOKMARK";
export default function Sholawat() {
  const loaderRoot = useRouteLoaderData("root");
  const opts = loaderRoot?.opts || {};
  const sholawat = data;

  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);

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
    .filter((item) => item.type === "sholawat")
    .map((item) => {
      const params = new URLSearchParams(item.source.split("?")[1]);
      return {
        created_at: item.created_at,
        id: params.get("index"),
        source: item.source,
      };
    });

  const toggleBookmark = (ayat) => {
    const newBookmarks = save_bookmarks(
      "sholawat",
      {
        title: ayat.nama,
        arab: ayat.arab,
        latin: ayat.latin,
        translation: ayat.arti,
        source: `/muslim/sholawat?index=${ayat.index}`,
      },
      [...bookmarks],
    );

    const is_saved = bookmarks_ayah.find((fav) => fav.id === ayat.index);

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
  return (
    <div className="prose dark:prose-invert max-w-4xl mx-auto border-x">
      <div className="p-1.5 flex justify-end">
        <DisplaySetting opts={opts} />
      </div>
      <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize border-t py-3">
        Sholawat
      </div>

      {sholawat.map((d, index) => {
        const ayat = {
          ...d,
          index: index.toString(),
        };

        const _source = `/muslim/sholawat?index=${ayat.index}`;
        const isFavorite = bookmarks_ayah.some((fav) => fav.source === _source);
        return (
          <div
            key={index}
            className="group relative px-4 py-4 sm:px-5 rounded-md border-t"
          >
            <div className="flex items-center sm:items-start sm:justify-between gap-x-2 mb-2">
              <div className="text-primary font-medium text-lg sm:order-first order-last">
                {ayat.nama}
              </div>

              <button
                onClick={() => toggleBookmark(ayat)}
                className={cn(
                  "order-0 sm:order-1 bg-gradient-to-br from-muted to-accent p-3 rounded-xl",
                  isFavorite &&
                    "from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20",
                )}
              >
                <Heart
                  className={cn(
                    "w-5 h-5 text-muted-foreground",
                    isFavorite && "text-rose-600 dark:text-rose-400",
                  )}
                />
              </button>
            </div>
            <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
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
                {ayat.arab}
              </div>
            </div>
            <div className="">
              {opts?.font_latin === "on" && (
                <div
                  className="latin-text prose max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: ayat.latin,
                  }}
                />
              )}
              {opts?.font_translation === "on" && (
                <div
                  className="translation-text mt-1 prose max-w-none text-accent-foreground"
                  dangerouslySetInnerHTML={{
                    __html: ayat.arti,
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
