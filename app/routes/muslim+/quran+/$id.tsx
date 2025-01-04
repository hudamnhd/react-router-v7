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
import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import { Button, buttonVariants } from "#app/components/ui/button";
import {
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

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

import cache from "#app/utils/cache-server.ts";

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

import { getCache, setCache } from "#app/utils/cache-client.ts";

const FAVORITES_KEY = "FAVORITES";
const LASTVISIT_KEY = "LASTVISIT";
const LASTREAD_KEY = "LASTREAD";

import { fontSizeOpt } from "#/app/constants/prefs";

export default function Index() {
  const { group_surat, id } = useLoaderData();
  const loaderRoot = useRouteLoaderData("root");
  const opts = loaderRoot?.opts || {};
  const [favorites, setFavorites] = useState<Array>([]);
  const [lastRead, setLastRead] = useState<number | null>(null);

  useEffect(() => {
    // fetcher.load(`/resources/quran/page/${params.id}`);
    const loadFavorites = async () => {
      // if (surat) {
      //   await setCache(LASTVISIT_KEY, surat);
      // }

      const storedFavorites = await getCache(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(storedFavorites);
      }
    };

    const loadLastRead = async () => {
      const storedLastRead = await getCache(LASTREAD_KEY);
      if (storedLastRead !== null) {
        setLastRead(storedLastRead);
      }
    };

    loadFavorites();
    loadLastRead();
  }, [id]);

  // Simpan data favorit ke localForage
  useEffect(() => {
    const saveFavorites = async (favorites) => {
      await setCache(FAVORITES_KEY, favorites);
    };
    saveFavorites(favorites);
  }, [favorites]);

  // Simpan ayat terakhir dibaca ke localForage

  useEffect(() => {
    if (lastRead !== null) {
      const saveLastRead = async (lastRead) => {
        await setCache(LASTREAD_KEY, lastRead);
      };
      saveLastRead(lastRead);
    }
  }, [lastRead]);

  // Fungsi untuk toggle favorit
  const toggleFavorite = (ayat) => {
    const isFavorite = favorites.some((fav) => fav.id === ayat.id);

    if (isFavorite) {
      // Hapus ayat dari favorites
      setFavorites(favorites.filter((fav) => fav.id !== ayat.id));
    } else {
      // Tambahkan ayat ke favorites
      setFavorites([...favorites, ayat]);
    }
  };

  // Tandai ayat sebagai terakhir dibaca
  const handleRead = (ayat) => {
    setLastRead(ayat); // Set ayat yang terakhir dibaca
  };

  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);
  return (
    <div className="prose dark:prose-invert max-w-4xl mx-auto border-x divide-y">
      <div className="m-1.5 flex justify-end">
        <DisplaySetting opts={opts} />
      </div>

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
                {d.ayat.map((dt) => {
                  const isFavorite = favorites.some((fav) => fav.id === dt.id);
                  const isLastRead = lastRead?.id === dt.id;

                  return (
                    <div className="border-t" key={dt.id}>
                      <div
                        className={cn(
                          "group relative py-4 px-4 sm:px-5",
                          isFavorite &&
                            "bg-gradient-to-b from-background via-background to-pink-400/50 dark:to-pink-600/50",
                          isLastRead &&
                            "bg-gradient-to-b from-background via-background to-lime-400/50 dark:to-lime-600/50",
                        )}
                      >
                        <div className="w-full text-right flex gap-x-2.5 items-center justify-between">
                          <div className="flex items-center gap-x-3">
                            {isFavorite ? (
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
                            {isLastRead && (
                              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 p-2 rounded-xl">
                                <Bookmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                            )}
                            <MenuTrigger>
                              <Button
                                aria-label="Menu"
                                variant="secondary"
                                size="icon"
                                className="[&_svg]:size-5 rounded-xl h-9 w-9"
                              >
                                <Ellipsis />
                              </Button>
                              <Popover className=" bg-background p-1 w-44 overflow-auto rounded-md shadow-lg ring-1 ring-black ring-opacity-5 entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95 fill-mode-forwards origin-top-left">
                                <Menu className="outline-none">
                                  <ActionItem
                                    id="new"
                                    onAction={() => toggleFavorite(dt)}
                                  >
                                    <Heart className="mr-2 w-4 h-4" /> Favorite
                                  </ActionItem>
                                  <ActionItem
                                    id="open"
                                    onAction={() => handleRead(dt)}
                                  >
                                    <Bookmark className="mr-2 w-4 h-4" />{" "}
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
          className={cn(
            buttonVariants({ size: "icon", variant: "outline" }),
            "mt-2 sm:mt-0",
          )}
          to={`/muslim/quran/${parseInt(id) - 1}`}
          disabled={parseInt(id) === 1}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon />
        </Link>

        <span className="text-accent-foreground">
          Halaman <strong>{id}</strong> dari <strong>604</strong>
        </span>
        <Link
          className={cn(
            buttonVariants({ size: "icon", variant: "outline" }),
            "mt-2 sm:mt-0",
          )}
          to={`/muslim/quran/${parseInt(id) + 1}`}
          disabled={parseInt(id) === 604}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon />
        </Link>
      </div>
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
