import cache from "#app/utils/cache-server.ts";
import { cn } from "#app/utils/misc.tsx";
import { Link, useLoaderData, useRouteLoaderData } from "@remix-run/react";
import {
  Dialog,
  Heading,
  DialogTrigger,
  Button as ButtonTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import React, { useState, useEffect } from "react";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import { Button, buttonVariants } from "#app/components/ui/button";
import {
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Heart,
  Ellipsis,
  Dot,
  Minus,
  X,
  BookOpen,
} from "lucide-react";
import ky from "ky";
import { data as daftar_surat } from "#app/constants/daftar-surat.json";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { save_bookmarks, type Bookmark } from "#app/utils/bookmarks";

import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = ({ data }) => {
  const { group_surat } = data;
  const surah_name = Object.values(group_surat)[0].surah?.name_id;
  return [{ title: surah_name + " | Doti App" }];
};

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const api = ky.create({ prefixUrl: "https://api.myquran.com/v2/quran" });

  const url = new URL(request.url);
  const intent = url.searchParams.get("intent") || "page";
  const { id } = params;

  const cacheKey = `quran-page-${id}`;
  const cacheData = cache.get(cacheKey);

  if (cacheData) {
    return cacheData;
  }

  const is_get_surah = intent === "surat";
  const page = is_get_surah ? await api.get(`ayat/${id}/1`).json() : null;

  if (is_get_surah && !page.status) {
    throw new Response("Not Found", { status: 404 });
  }

  if (is_get_surah && page.status) {
    const page_ayah = page.data[0].page;
    return redirect(`/muslim/quran/${page_ayah}`);
  }

  const ayat = await api.get(`ayat/page/${id}`).json();

  if (!ayat.status) {
    throw new Response("Not Found", { status: 404 });
  }

  const group_surat = ayat.data.reduce((result, item, index, array) => {
    const no_surah = item.surah; // Ambil nomor surah
    const detail = daftar_surat.find((d) => d.number === no_surah);

    // Jika belum ada surah di result, inisialisasi dengan detail dan array kosong
    if (!result[no_surah]) {
      result[no_surah] = { surah: detail, ayat: [] };
    }

    // Tambahkan ayat ke array surah
    result[no_surah].ayat.push(item);

    return result;
  }, {});

  const data = {
    group_surat,
    id,
  };

  cache.set(cacheKey, data);
  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=31560000",
    },
  });
}

import { get_cache, set_cache } from "#app/utils/cache-client.ts";

const FAVORITES_KEY = "FAVORITES";
const BOOKMARK_KEY = "BOOKMARK";
const LASTREAD_KEY = "LASTREAD";

import { fontSizeOpt } from "#/app/constants/prefs";

export default function Index() {
  const renderCount = React.useRef(0);
  renderCount.current++;
  const { group_surat, id } = useLoaderData();
  const loaderRoot = useRouteLoaderData("root");
  const opts = loaderRoot?.opts || {};
  const [lastRead, setLastRead] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);

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

  const bookmarks_ayah = bookmarks
    .filter((item) => item.type === "ayat") // Hanya ambil item dengan type "ayat"
    .map((item) => {
      const params = new URLSearchParams(item.source.split("?")[1]); // Ambil query string setelah "?"
      return {
        created_at: item.created_at,
        id: params.get("ayat"),
      }; // Ambil nilai "ayat"
    });

  React.useEffect(() => {
    const save_bookmark_to_lf = async (bookmarks) => {
      await set_cache(BOOKMARK_KEY, bookmarks);
    };
    save_bookmark_to_lf(bookmarks);
  }, [bookmarks]);

  // Simpan ayat terakhir dibaca ke localForage

  useEffect(() => {
    if (lastRead !== null) {
      const saveLastRead = async (lastRead) => {
        await set_cache(LASTREAD_KEY, lastRead);
      };
      saveLastRead(lastRead);
    }
  }, [lastRead]);

  // Fungsi untuk toggle favorit
  const toggleBookmark = (ayat) => {
    const newBookmarks = save_bookmarks(
      "ayat",
      {
        title: `${ayat.surah_name}:${ayat.id}`,
        arab: ayat.arab,
        latin: ayat.latin,
        translation: ayat.text,
        source: `/muslim/quran/${ayat.page}?ayat=${ayat.id}&surah=${ayat.surah}&juz=${ayat.juz}`,
      },
      [...bookmarks],
    );

    const is_saved = bookmarks_ayah.find((fav) => fav.id === ayat.id);

    if (is_saved) {
      const newBookmarks = bookmarks?.filter(
        (d) => d.created_at !== is_saved.created_at,
      );
      setBookmarks(newBookmarks);
    } else {
      setBookmarks(newBookmarks);
    }
  };

  // Tandai ayat sebagai terakhir dibaca
  const handleRead = (ayat) => {
    const isLastRead = lastRead?.id === ayat.id;
    if (isLastRead) {
      setLastRead(null);
    } else {
      setLastRead(ayat);
    }
  };
  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);

  return (
    <div className="relative  max-w-4xl mx-auto w-full border-x">
      <div className="p-1.5 flex justify-between gap-x-3 border-b">
        <Link
          className={cn(
            buttonVariants({ variant: "link" }),
            "prose-none pl-1 [&_svg]:size-7 ",
          )}
          to={`/muslim/quran/${parseInt(id) - 1}`}
        >
          <ChevronLeft />
          <span className="text-lg font-semibold">Al-Fatihah</span>
        </Link>
        {/*<Link
          className={cn(
            buttonVariants({ variant: "outline" }),
            "xl:hidden flex",
          )}
          to="/muslim/quran/"
        >
          <BookOpen size={16} strokeWidth={2} aria-hidden="true" />
          <span>List</span>
        </Link>*/}
        <DisplaySetting opts={opts} />
      </div>
      {/*{renderCount.current}*/}
      {Object.values(group_surat).map((d) => {
        const first_ayah = d.ayat[0]?.ayah;
        const last_ayah = d.ayat[d.ayat.length - 1]?.ayah;
        return (
          <React.Fragment key={d.surah.number}>
            <div className="prose dark:prose-invert max-w-none">
              <React.Fragment>
                <DialogTrigger type="modal">
                  <ButtonTrigger className="w-full">
                    <div className="text-3xl font-bold md:text-4xl w-fit mx-auto mt-2 mb-3">
                      {d.surah.name_id}
                      <span className="ml-2 underline-offset-4 group-hover:underline font-lpmq">
                        ( {d.surah.name_short} )
                      </span>
                      <div className="flex items-center text-base font-medium justify-center">
                        Hal {id}
                        <Dot />
                        <span>Ayat {first_ayah}</span>
                        <Minus />
                        <span>{last_ayah}</span>
                      </div>
                    </div>
                  </ButtonTrigger>
                  <ModalOverlay
                    isDismissable
                    className={({ isEntering, isExiting }) =>
                      cn(
                        "fixed inset-0 z-50 bg-black/80",
                        isEntering
                          ? "animate-in fade-in duration-300 ease-out"
                          : "",
                        isExiting
                          ? "animate-out fade-out duration-300 ease-in"
                          : "",
                      )
                    }
                  >
                    <Modal
                      className={({ isEntering, isExiting }) =>
                        cn(
                          "fixed z-50 w-full bg-background sm:rounded-md inset-x-0 bottom-0 px-2 pb-4 outline-none sm:max-w-3xl mx-auto",
                          isEntering
                            ? "animate-in slide-in-from-bottom duration-300"
                            : "",
                          isExiting
                            ? "animate-out slide-out-to-bottom duration-300"
                            : "",
                        )
                      }
                    >
                      <Dialog
                        role="alertdialog"
                        className="outline-none relative"
                      >
                        {({ close }) => (
                          <div className="grid gap-2.5 px-2">
                            <div className="w-fit mx-auto">
                              <Button
                                onPress={close}
                                size="sm"
                                className="mt-4 mb-3 h-2 w-[100px] rounded-full bg-muted"
                              />
                            </div>
                            <p className="-translate-y-0 text-xl sm:text-2xl font-semibold font-lpmq-2 text-center mb-1.5">
                              {d.surah.name_long}
                            </p>
                            <Heading>
                              {d.surah.number}. {d.surah.name_id}
                              <span className="ml-2 font-normal">
                                ( {d.surah.translation_id} )
                              </span>
                            </Heading>

                            <div className="flex items-center text-muted-foreground gap-1">
                              <span>{d.surah.revelation_id}</span>
                              <div className="w-2 relative">
                                <Dot className="absolute -left-2 -top-3" />
                              </div>
                              <span>{d.surah.number_of_verses} ayat</span>
                            </div>

                            <div className="max-h-[70vh] overflow-y-auto">
                              <div className="mb-4">
                                <h3 className="font-bold text-lg">Tafsir</h3>
                                <p className="prose max-w-none">
                                  {d.surah.tafsir}
                                </p>
                              </div>

                              <div className="mb-4">
                                <h3 className="font-bold mb-1">Audio</h3>
                                <audio controls className="w-full">
                                  <source
                                    src={d.surah.audio_url}
                                    type="audio/mpeg"
                                  />
                                  Your browser does not support the audio
                                  element.
                                </audio>
                              </div>
                            </div>
                            <div className="flex items-center justify-center w-full outline-none">
                              <Button
                                onPress={close}
                                variant="outline"
                                className="w-full"
                              >
                                <X />
                                Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </Dialog>
                    </Modal>
                  </ModalOverlay>
                </DialogTrigger>
              </React.Fragment>

              <div className="">
                {d.ayat.map((_dt) => {
                  const surah_name = d.surah.name_id;
                  const dt = {
                    ..._dt,
                    surah_name,
                  };
                  const isFavorite = bookmarks_ayah.some(
                    (fav) => fav.id === dt.id,
                  );
                  const isLastRead = lastRead?.id === dt.id;

                  return (
                    <div className="border-t" key={dt.id}>
                      <div
                        className={cn(
                          "group relative py-4 px-4 sm:px-5",
                          isFavorite &&
                            "shadow-md shadow-pink-500 bg-gradient-to-bl from-background via-background to-pink-400/50 dark:to-pink-600/50",
                          isLastRead &&
                            "shadow-md shadow-blue-500 bg-gradient-to-bl from-background via-background to-blue-400/50 dark:to-blue-600/50",
                        )}
                      >
                        <div className="w-full text-right flex gap-x-2.5 items-center justify-between">
                          <div className="flex items-center gap-x-3">
                            {isLastRead ? (
                              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 p-3 rounded-xl">
                                <Bookmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                            ) : isFavorite ? (
                              <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20 p-3 rounded-xl">
                                <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                              </div>
                            ) : (
                              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 p-3 rounded-xl">
                                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                            )}
                            <div className="grid text-left">
                              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                Ayat {dt.ayah}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                Juz {dt.juz} • Hal {dt.page}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-x-2">
                            <MenuTrigger>
                              <Button
                                aria-label="Menu"
                                variant="secondary"
                                size="icon"
                                className={cn(
                                  "[&_svg]:size-5 rounded-xl h-9 w-9",
                                  isFavorite &&
                                    "bg-gradient-to-br from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20 p-3 rounded-xl text-rose-600 dark:text-rose-400",
                                  isLastRead &&
                                    "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 p-2 rounded-xl text-blue-600 dark:text-blue-400",
                                )}
                              >
                                <Ellipsis />
                              </Button>
                              <Popover className=" bg-background p-1 w-44 overflow-auto rounded-md shadow-lg ring-1 ring-black ring-opacity-5 entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95 fill-mode-forwards origin-top-left">
                                <Menu className="outline-none">
                                  <ActionItem
                                    id="new"
                                    onAction={() => toggleBookmark(dt)}
                                  >
                                    <Heart
                                      className={cn(
                                        "mr-1 w-4 h-4",
                                        isFavorite &&
                                          "fill-rose-500 text-rose-500",
                                      )}
                                    />
                                    Bookmark
                                  </ActionItem>
                                  <ActionItem
                                    id="open"
                                    onAction={() => handleRead(dt)}
                                  >
                                    <Bookmark
                                      className={cn(
                                        "mr-1 w-4 h-4",
                                        isLastRead &&
                                          "fill-blue-500 text-blue-500",
                                      )}
                                    />
                                    Terakhir Baca
                                  </ActionItem>
                                </Menu>
                              </Popover>
                            </MenuTrigger>
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
                              lineHeight:
                                font_size_opts?.lineHeight || "3.5rem",
                            }}
                          >
                            {dt.arab}
                          </div>
                        </div>
                        {opts?.font_latin === "on" && (
                          <div className="translation-text">
                            <div
                              className="max-w-none prose-normal duration-300 text-muted-foreground mb-2"
                              dangerouslySetInnerHTML={{
                                __html: dt.latin,
                              }}
                            />
                          </div>
                        )}

                        {opts?.font_translation === "on" && (
                          <div className="translation-text">
                            <div
                              className="max-w-none prose text-accent-foreground"
                              dangerouslySetInnerHTML={{
                                __html: dt.text,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Pagination Controls */}
            </div>
          </React.Fragment>
        );
      })}

      {/* Pagination Controls */}
      <div className="ml-auto flex items-center justify-center gap-3 py-5 border-t ">
        <Link
          className={cn(buttonVariants({ size: "icon", variant: "outline" }))}
          to={`/muslim/quran/${parseInt(id) - 1}`}
          disabled={parseInt(id) === 1}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft />
        </Link>

        <span className="text-accent-foreground text-sm">
          Halaman <strong>{id}</strong> dari <strong>604</strong>
        </span>
        <Link
          className={cn(buttonVariants({ size: "icon", variant: "outline" }))}
          to={`/muslim/quran/${parseInt(id) + 1}`}
          disabled={parseInt(id) === 604}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight />
        </Link>
      </div>
      <GoTopButton />
    </div>
  );
}
import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import type { MenuItemProps } from "react-aria-components";

function ActionItem(props: MenuItemProps) {
  return (
    <MenuItem
      {...props}
      className="bg-background relative flex gap-1.5 select-none items-center rounded-sm px-2 py-1.5 outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50  [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0"
    />
  );
}

// Fungsi untuk mengonversi angka ke format Arab
const toArabicNumber = (number: number) => {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return number
    .toString()
    .split("")
    .map((digit) => arabicDigits[parseInt(digit)])
    .join("");
};

const AyatList: React.FC<{ ayats: { number: number; text: string }[] }> = ({
  ayats,
}) => {
  return (
    <div className="mt-4">
      {ayats.map((ayat) => (
        <div
          key={ayat.number}
          className="flex items-center gap-2 border-b py-2"
        >
          <span className="text-xl font-bold">
            {toArabicNumber(ayat.number)}
          </span>
          <p className="text-right text-lg font-serif">{ayat.text}</p>
        </div>
      ))}
    </div>
  );
};

const GoTopButton = () => {
  const [showGoTop, setShowGoTop] = useState(false);

  const handleVisibleButton = () => {
    setShowGoTop(window.pageYOffset > 50);
  };

  const handleScrollUp = () => {
    window.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleVisibleButton);
  }, []);

  return (
    <div
      className={cn(
        "sticky bottom-2 inset-x-0 ml-auto w-fit -translate-x-2",
        !showGoTop && "hidden",
      )}
    >
      <Button onPress={handleScrollUp} variant="outline" size="icon">
        <ArrowUp />
      </Button>
    </div>
  );
};
