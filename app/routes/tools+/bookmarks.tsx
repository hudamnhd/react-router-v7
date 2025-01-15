import React from "react";
import {
  ExternalLink,
  Heart,
  Ellipsis,
  ChevronLeft,
  MoveRight,
} from "lucide-react";
import { Button, buttonVariants } from "#app/components/ui/button";
import { save_bookmarks, type Bookmark } from "#app/utils/bookmarks";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import { useRouteLoaderData, Link, useNavigate } from "@remix-run/react";
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
    <div className="prose dark:prose-invert max-w-xl mx-auto border-x border-b min-h-screen">
      <div className="px-1.5 pt-2.5 pb-2 flex justify-between gap-x-3 border-b">
        <div className="flex items-center gap-x-2">
          <Link
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
              "prose-none [&_svg]:size-6",
            )}
            to="/muslim"
          >
            <ChevronLeft />
          </Link>
          <span className="text-lg font-semibold">Bookmarks</span>
        </div>

        <DisplaySetting />
      </div>
      <div
        className={cn(
          "text-center text-3xl font-bold leading-tight tracking-tighter capitalize py-2 border-b",
        )}
      >
        Bookmarks
      </div>
      <div className="divide-y">
        {bookmarks?.length > 0 ? (
          bookmarks.map((d, index) => {
            if (
              d.type === "ayat" ||
              d.type === "doa" ||
              d.type === "sholawat"
            ) {
              return (
                <div key={index} className="group relative p-3">
                  <div className="flex items-center justify-between gap-x-2">
                    <Link
                      to={d.source}
                      className={cn(
                        buttonVariants({ variant: "link" }),
                        "gap-2 p-0 -mt-2 text-lg",
                      )}
                    >
                      {d.title}
                    </Link>
                    <div className="absolute flex gap-x-1.5 justify-end w-full -translate-y-7 items-center right-3">
                      <MenuTrigger>
                        <Button
                          aria-label="Menu"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
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
                              onAction={() =>
                                handleDeleteBookmark(d.created_at)
                              }
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
                  </div>
                  <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
                    <div
                      className={cn(
                        "relative text-right text-primary my-3 font-lpmq",
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
                    {opts?.font_latin === "on" && d.latin && (
                      <div
                        className="latin-text prose prose dark:prose-invert max-w-none leading-6"
                        dangerouslySetInnerHTML={{
                          __html: d.latin,
                        }}
                      />
                    )}
                    {opts?.font_translation === "on" && d.translation && (
                      <div
                        className="translation-text mt-3 prose prose dark:prose-invert max-w-none leading-6"
                        dangerouslySetInnerHTML={{
                          __html: d.translation,
                        }}
                      />
                    )}
                    {d.tafsir && (
                      <details className="group [&_summary::-webkit-details-marker]:hidden mt-3">
                        <summary className="flex cursor-pointer items-center gap-1.5 outline-none">
                          <div className="group-open:animate-slide-left [animation-fill-mode:backwards] group-open:block hidden font-medium text-sm text-indigo-600 dark:text-indigo-400">
                            Hide Tafsir
                          </div>
                          <div className="animate-slide-left group-open:hidden font-medium text-sm text-indigo-600 dark:text-indigo-400">
                            View Tafsir
                          </div>

                          <svg
                            className="size-4 shrink-0 transition duration-300 group-open:-rotate-180 text-indigo-600 dark:text-indigo-400 opacity-80"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </summary>

                        <div className="group-open:animate-slide-left group-open:[animation-fill-mode:backwards] group-open:transition-all group-open:duration-300">
                          <div className="max-w-none prose-lg my-2.5 font-semibold whitespace-pre-wrap text-accent-foreground border-b">
                            Tafsir {d.title}
                          </div>
                          <p className="max-w-none leading-7 prose prose-base prose-gray dark:prose-invert whitespace-pre-wrap">
                            {d.tafsir.text}
                          </p>
                          <div className="text-muted-foreground text-xs prose-xs">
                            Sumber:
                            <br />
                            {d.tafsir.source}
                          </div>
                        </div>
                      </details>
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
      className="bg-background relative flex gap-1 select-none items-center rounded-sm px-2 py-1.5 outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50  [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-sm"
    />
  );
}
