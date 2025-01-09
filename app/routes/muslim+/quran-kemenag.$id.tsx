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
  ListCollapse,
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
  return [{ title: "Doti App" }];
};

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

export async function loader({ params }: LoaderFunctionArgs) {
  const api = ky.create({
    prefixUrl:
      "https://raw.githubusercontent.com/rioastamal/quran-json/refs/heads/master/surah",
  });

  const { id } = params;

  const surat = await api.get(`${id}.json`).json();

  const parse = Object.values(surat);

  if (!parse[0] && !parse[0].number) {
    throw new Response("Not Found", { status: 404 });
  }

  return json(parse[0], {
    headers: {
      "Cache-Control": "public, max-age=31560000",
    },
  });
}

import { get_cache, set_cache } from "#app/utils/cache-client.ts";

const BOOKMARK_KEY = "BOOKMARK";
const LASTREAD_KEY = "LASTREAD";

import { fontSizeOpt } from "#/app/constants/prefs";
export default function RouteX() {
  const loaderData = useLoaderData();
  return <SuratDetail surat={loaderData} />;
}

function Route() {
  const renderCount = React.useRef(0);
  renderCount.current++;

  const loaderData = useLoaderData();
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
    <div className="prose dark:prose-invert xl:max-w-6xl max-w-4xl mx-auto w-full border-x divide-y">
      <div className="p-1.5 flex xl:justify-end justify-between gap-x-3">
        <Link
          className={cn(
            buttonVariants({ variant: "outline" }),
            "xl:hidden flex",
          )}
          to="/muslim/quran/"
        >
          <BookOpen size={16} strokeWidth={2} aria-hidden="true" />
          <span>List</span>
        </Link>
        <DisplaySetting opts={opts} />
      </div>
      {/*{renderCount.current}*/}
      {/*{Object.values(group_surat).map((d) => {
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
                              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 p-2 rounded-xl">
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
            </div>
          </React.Fragment>
        );
      })}*/}
      <div className="">
        {loaderData.text.map((_dt) => {
          const surah_name = d.surah.name_id;
          const dt = {
            ..._dt,
            surah_name,
          };
          const isFavorite = bookmarks_ayah.some((fav) => fav.id === dt.id);
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
                      <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 p-2 rounded-xl">
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
                                isFavorite && "fill-rose-500 text-rose-500",
                              )}
                            />
                            Bookmark
                          </ActionItem>
                          <ActionItem id="open" onAction={() => handleRead(dt)}>
                            <Bookmark
                              className={cn(
                                "mr-1 w-4 h-4",
                                isLastRead && "fill-blue-500 text-blue-500",
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
                      lineHeight: font_size_opts?.lineHeight || "3.5rem",
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
      {/*<div className="ml-auto flex items-center justify-center gap-3 py-5 border-t ">
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
      </div>*/}
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

type SuratProps = {
  surat: {
    text: Record<string, string>; // Ayat Arab
    translations: {
      id: {
        name: string;
        text: Record<string, string>; // Terjemahan
      };
    };
    tafsir: {
      id: {
        kemenag: {
          name: string;
          source: string;
          text: Record<string, string>; // Tafsir
        };
      };
    };
  };
};

import { motion, useSpring, useScroll } from "framer-motion";

const SuratDetail: React.FC<SuratProps> = ({ surat }) => {
  const ayatKeys = Object.keys(surat.text); // Mendapatkan list nomor ayat

  const loaderRoot = useRouteLoaderData("root");
  const opts = loaderRoot?.opts || {};
  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <React.Fragment>
      <motion.div
        id="scroll-indicator"
        className="z-[60] bg-gradient-to-r from-fuchsia-500 to-cyan-500 dark:from-fuchsia-400 dark:to-cyan-400"
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
      <div className="prose-base dark:prose-invert w-full border-x">
        <div className="p-1.5 flex xl:justify-end justify-between gap-x-3 border-b">
          <Link
            className={cn(buttonVariants({ variant: "outline" }), "flex")}
            to="/muslim/quran-kemenag/"
          >
            <BookOpen size={16} strokeWidth={2} aria-hidden="true" />
            <span>Surat</span>
          </Link>
        </div>

        <div className="text-3xl font-bold md:text-4xl w-fit mx-auto text-primary">
          {surat.name_latin}
          <span className="ml-2 underline-offset-4 group-hover:underline font-lpmq">
            ( {surat.name} )
          </span>
          <div className="flex items-center text-sm font-medium justify-center -mt-1">
            <span className="">{surat.translations.id?.name}</span>
            <Dot />
            <span className="">Surat ke- {surat.number}</span>
            <Dot />
            <span>{surat.number_of_ayah} Ayat</span>
          </div>
        </div>
        <div className="py-5">
          {ayatKeys.map((key) => (
            <div
              key={key}
              className="group relative py-4 px-4 sm:px-5 border-t"
            >
              {/* Ayat Arab */}
              <div className="w-full text-right flex gap-x-2.5 items-end justify-end">
                <div
                  className={cn(
                    "relative text-right text-primary my-5 font-lpmq prose",
                  )}
                  style={{
                    fontWeight: opts.font_weight,
                    fontSize: font_size_opts?.fontSize || "1.5rem",
                    lineHeight: font_size_opts?.lineHeight || "3.5rem",
                  }}
                >
                  <span className="text-4xl inline-block mx-1">
                    {toArabicNumber(key)}
                  </span>{" "}
                  {surat.text[key]}
                </div>
              </div>

              <div className="max-w-none prose prose-base prose-gray dark:prose-invert whitespace-pre-wrap italic mb-2 opacity-80">
                {surat.translations.id.text[key]}
              </div>

              <details className="group [&_summary::-webkit-details-marker]:hidden">
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
                    Tafsir {surat.name_latin}:{key}{" "}
                  </div>
                  <p className="max-w-none prose prose-base prose-gray dark:prose-invert whitespace-pre-wrap">
                    {surat.tafsir.id.kemenag.text[key]}
                  </p>
                  {/*<TafsirText text={surat.tafsir.id.kemenag.text[key]} />*/}
                  <div className="text-muted-foreground text-xs prose-xs">
                    Sumber:
                    <br />
                    {surat.tafsir.id.kemenag.source}
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>

        <div className="ml-auto flex items-center justify-center gap-3 py-5 border-t ">
          <Link
            className={cn(buttonVariants({ size: "icon", variant: "outline" }))}
            to={`/muslim/quran-kemenag/${parseInt(surat.number) - 1}`}
            disabled={parseInt(surat.number) === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Link>

          <span className="text-accent-foreground text-sm">
            Surat <strong>{surat.number}</strong> dari <strong>114</strong>
          </span>
          <Link
            className={cn(buttonVariants({ size: "icon", variant: "outline" }))}
            to={`/muslim/quran-kemenag/${parseInt(surat.number) + 1}`}
            disabled={parseInt(surat.number) === 114}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Link>
        </div>
      </div>
    </React.Fragment>
  );
};
const TafsirText: React.FC<{ text?: string }> = ({ text }) => {
  if (!text) {
    return <p className="text-gray-500 italic">Tafsir tidak tersedia.</p>;
  }

  // Memformat teks menjadi paragraf panjang dengan gaya tailwind prose
  const formattedText = text.split("\n").map((line, index) => {
    // Jika line mengandung nomor poin (1., 2., 3.) atau huruf (a., b., c.), tambahkan bold
    if (/^\d+\./.test(line.trim())) {
      return (
        <p
          key={index}
          className="pl-2 max-w-none prose prose-base prose-gray dark:prose-invert whitespace-pre-wrap"
        >
          {line.trim()}
        </p>
      );
    } else if (/^[a-z]\./.test(line.trim())) {
      return (
        <p
          key={index}
          className="pl-4 max-w-none prose prose-base prose-gray dark:prose-invert whitespace-pre-wrap"
        >
          {line.trim()}
        </p>
      );
    } else {
      return (
        <p
          key={index}
          className="max-w-none prose prose-base prose-gray dark:prose-invert whitespace-pre-wrap"
        >
          {line.trim()}
        </p>
      ); // Line biasa tanpa format khusus
    }
  });

  return (
    <div className="max-w-none prose prose-base prose-gray dark:prose-invert whitespace-pre-wrap mb-3">
      {formattedText}
    </div>
  );
};
