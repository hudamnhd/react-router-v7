import React from "react";
import { data as daftar_surat } from "#app/constants/daftar-surat.json";
// Define types for bookmark data
import {
  Trash2,
  ExternalLink,
  Heart,
  Ellipsis,
  Dot,
  Minus,
  X,
  BookOpen,
} from "lucide-react";
import { Button } from "#app/components/ui/button";
import { save_bookmarks, type Bookmark } from "#app/utils/bookmarks";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import { useRouteLoaderData, useNavigate } from "@remix-run/react";
import { fontSizeOpt } from "#/app/constants/prefs";
import { cn } from "#app/utils/misc.tsx";
import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import type { MenuItemProps } from "react-aria-components";

// React Component Example

import { get_cache, set_cache } from "#app/utils/cache-client.ts";
const BOOKMARK_KEY = "BOOKMARK";
const LASTREAD_KEY = "LASTREAD";

const App: React.FC = () => {
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);
  const [lastRead, setLastRead] = React.useState<number | null>(null);

  const loaderRoot = useRouteLoaderData("root");
  const navigate = useNavigate();
  const opts = loaderRoot?.opts || {};

  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);
  React.useEffect(() => {
    const load_bookmark_from_lf = async () => {
      const storedBookmarks = await get_cache(BOOKMARK_KEY);
      const storedLastRead = await get_cache(LASTREAD_KEY);
      if (storedLastRead !== null) {
        setLastRead(storedLastRead);
      }
      if (storedBookmarks) {
        setBookmarks(storedBookmarks);
      }
    };

    load_bookmark_from_lf();
  }, []);

  React.useEffect(() => {
    const save_bookmark_to_lf = async (bookmarks) => {
      await set_cache(BOOKMARK_KEY, bookmarks);
    };
    save_bookmark_to_lf(bookmarks);
  }, [bookmarks]);

  React.useEffect(() => {
    if (lastRead !== null) {
      const saveLastRead = async (lastRead) => {
        await set_cache(LASTREAD_KEY, lastRead);
      };
      saveLastRead(lastRead);
    }
  }, [lastRead]);

  const handleRead = (ayat) => {
    const isLastRead = lastRead?.id === ayat.id;
    if (isLastRead) {
      setLastRead(null);
    } else {
      setLastRead(ayat);
    }
  };

  const handleAddAyat = () => {
    try {
      const newBookmarks = save_bookmarks(
        "ayat",
        {
          arab: "إن الله مع الصابرين",
          latin: "Inna Allaha ma'a as-sabireen",
          translation: "Sesungguhnya Allah beserta orang-orang yang sabar.",
          source: "Al-Baqarah: 153",
        },
        [...bookmarks],
      );
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddLink = () => {
    try {
      const newBookmarks = save_bookmarks(
        "link",
        { path: "https://example.com" },
        [...bookmarks],
      );
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteBookmark = (created_at: string) => {
    try {
      const newBookmarks = bookmarks?.filter(
        (d) => d.created_at !== created_at,
      );
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="prose dark:prose-invert max-w-4xl mx-auto border-x border-b">
      <div className="p-1.5 flex justify-end">
        <DisplaySetting opts={opts} />
      </div>
      {lastRead && (
        <React.Fragment>
          <div className="bg-gradient-to-b from-background via-background to-blue-400/50 dark:to-blue-600/50 text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize border-t py-3">
            Last Read
          </div>
          <div>
            <div className="group relative px-4 pb-4 sm:px-5 rounded-md border-t">
              <div className="flex items-center justify-between gap-x-2 pt-2">
                <div className="font-bold text-lg">
                  {lastRead.surah_name}:{lastRead.ayah}
                </div>

                <Button
                  id="goto-last"
                  size="icon"
                  variant="outline"
                  onPress={() => navigate(`/muslim/quran/${lastRead.surah}`)}
                >
                  <ExternalLink />
                </Button>
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
                  {lastRead.arab}
                </div>
              </div>
              <div className="">
                {opts?.font_latin === "on" && (
                  <div
                    className="latin-text prose max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{
                      __html: lastRead.latin,
                    }}
                  />
                )}
                {opts?.font_translation === "on" && (
                  <div
                    className="translation-text mt-3 prose max-w-none text-accent-foreground italic"
                    dangerouslySetInnerHTML={{
                      __html: lastRead.text,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </React.Fragment>
      )}
      <div
        className={cn(
          "border-b text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize border-t py-3",
          bookmarks?.length > 3 &&
            "bg-gradient-to-b from-background via-background to-pink-400/50 dark:to-pink-600/50 ",
        )}
      >
        Bookmarks
      </div>
      <div>
        {bookmarks?.length > 0 ? (
          bookmarks.map((d, index) => {
            if (
              d.type === "ayat" ||
              d.type === "doa" ||
              d.type === "sholawat"
            ) {
              return (
                <div
                  key={index}
                  className="group relative px-4 pb-4 sm:px-5 rounded-md border-t"
                >
                  <div className="flex items-center justify-between gap-x-2 pt-2">
                    <div className="font-bold text-lg">{d.title}</div>

                    <MenuTrigger>
                      <Button
                        aria-label="Menu"
                        variant="secondary"
                        size="icon"
                        className="[&_svg]:size-5 rounded-xl h-9 w-9"
                      >
                        <Ellipsis />
                      </Button>
                      <Popover
                        placement="start"
                        className=" bg-background p-1 w-50 overflow-auto rounded-md shadow-lg border entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95 fill-mode-forwards origin-top-left"
                      >
                        <Menu className="outline-none">
                          <ActionItem
                            id="new"
                            onAction={() => handleDeleteBookmark(d.created_at)}
                          >
                            <Heart className="fill-rose-500 text-rose-500 mr-1.5 w-4 h-4" />
                            Delete bookmark
                          </ActionItem>
                          <ActionItem
                            id="goto"
                            onAction={() => navigate(d.source)}
                          >
                            <ExternalLink className="mr-1.5 w-4 h-4" />
                            Go to ayat
                          </ActionItem>
                        </Menu>
                      </Popover>
                    </MenuTrigger>
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
                      {d.arab}
                    </div>
                  </div>
                  <div className="">
                    {opts?.font_latin === "on" && (
                      <div
                        className="latin-text prose max-w-none text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html: d.latin,
                        }}
                      />
                    )}
                    {opts?.font_translation === "on" && (
                      <div
                        className="translation-text mt-3 prose max-w-none text-accent-foreground italic"
                        dangerouslySetInnerHTML={{
                          __html: d.translation,
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            }
          })
        ) : (
          <div className="text-center text-muted-foreground py-6">
            You don't have any bookmarks yet
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

function ActionItem(props: MenuItemProps) {
  return (
    <MenuItem
      {...props}
      className="bg-background relative flex gap-1.5 select-none items-center rounded-sm px-2 py-1.5 outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50  [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0"
    />
  );
}
