import { cn } from "#app/utils/misc.tsx";
import {
  Popover,
  PopoverDialog,
  PopoverTrigger,
} from "#app/components/ui/popover";
import { id } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { ScrollToFirstIndex } from "#app/components/custom/scroll-to-top.tsx";
import { type loader as RootLoader } from "#app/root.tsx";
import { Link, useLoaderData, useRouteLoaderData } from "@remix-run/react";
import React, { useState, useEffect } from "react";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import { Button, buttonVariants } from "#app/components/ui/button";
import { Badge } from "#app/components/ui/badge";
import { Input } from "#app/components/ui/input";
import { FieldGroup, Label } from "#app/components/ui/field";
import {
  NumberField,
  NumberFieldInput,
  NumberFieldSteppers,
} from "#app/components/ui/number-field";
import {
  ChevronLeft,
  ChevronRight,
  MoveDown,
  Bookmark,
  Star,
  Ellipsis,
  Dot,
} from "lucide-react";
import ky from "ky";
import { data as daftar_surat } from "#app/constants/daftar-surat.json";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import {
  save_bookmarks,
  type Bookmark as BookmarkType,
} from "#app/utils/bookmarks";

import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const surat = data?.number + ". " + data?.name_latin;
  return [{ title: surat + " | Doti App" }];
};

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

export type Ayat = {
  number: string;
  name: string;
  name_latin: string;
  number_of_ayah: string;
  text: { [key: string]: string };
  translations: {
    id: {
      name: string;
      text: { [key: string]: string };
    };
  };
  tafsir: {
    id: {
      kemenag: {
        name: string;
        source: string;
        text: { [key: string]: string };
      };
    };
  };
};

type Surah = Record<string, Ayat>; // Object with dynamic string keys

export async function loader({ request, params }: LoaderFunctionArgs) {
  const api = ky.create({
    prefixUrl:
      "https://raw.githubusercontent.com/rioastamal/quran-json/refs/heads/master/surah",
  });

  const url = new URL(request.url);
  const ayat_number = url.searchParams.get("ayat");
  const { id } = params;

  const surat = await api.get(`${id}.json`).json<Surah>();

  const parse = Object.values(surat);
  const ayat = parse[0];

  if (!ayat) {
    throw new Response("Not Found", { status: 404 });
  }
  const data = {
    ...ayat,
    ayat_number,
  };

  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=31560000",
    },
  });
}

import { get_cache, set_cache } from "#app/utils/cache-client.ts";

const BOOKMARK_KEY = "BOOKMARK";
const LASTREAD_KEY = "LASTREAD";

import { fontSizeOpt } from "#/app/constants/prefs";

import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import type { MenuItemProps } from "react-aria-components";

function ActionItem(props: MenuItemProps) {
  return (
    <MenuItem
      {...props}
      className="bg-background relative flex gap-1 select-none items-center rounded-sm px-2 py-1.5 outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50  [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-sm"
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

import { useVirtualizer } from "@tanstack/react-virtual";

const SuratDetail: React.FC = () => {
  const surat = useLoaderData<typeof loader>();
  const loaderRoot = useRouteLoaderData<typeof RootLoader>("root");
  const opts = loaderRoot?.opts || {};
  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);

  return (
    <React.Fragment>
      <div className="prose-base dark:prose-invert w-full max-w-xl mx-auto border-x">
        <div className="px-1.5 pt-2.5 pb-2 flex justify-between gap-x-3 border-b">
          <div className="flex items-center gap-x-2">
            <Link
              className={cn(
                buttonVariants({ size: "icon", variant: "outline" }),
                "prose-none [&_svg]:size-6",
              )}
              to="/muslim/quran"
            >
              <ChevronLeft />
            </Link>
            <span className="text-lg font-semibold line-clamp-1">
              {surat.number}. {surat.name_latin}{" "}
            </span>
          </div>

          <DisplaySetting />
        </div>

        <VirtualizedListSurah>
          <div className="text-3xl font-bold md:text-4xl w-fit mx-auto text-primary pb-3 pt-1">
            {surat.name_latin}
            <span className="ml-2 underline-offset-4 group-hover:underline font-lpmq">
              ( {surat.name} )
            </span>
            <div className="flex items-center text-sm font-medium justify-center -mt-3">
              <span className="">{surat.translations.id?.name}</span>
              <Dot />
              <span className="">Surat ke- {surat.number}</span>
              <Dot />
              <span>{surat.number_of_ayah} Ayat</span>
            </div>
          </div>

          <div className="ml-auto flex items-center justify-center gap-3 py-5 ">
            <Link
              className={cn(
                buttonVariants({ size: "icon", variant: "outline" }),
              )}
              to={
                parseInt(surat?.number as string) === 1
                  ? "#"
                  : `/muslim/quran-word-by-word/${parseInt(surat?.number as string) - 1}`
              }
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Link>

            <span className="text-accent-foreground text-sm">
              Surat <strong>{surat?.number}</strong> dari <strong>114</strong>
            </span>
            <Link
              className={cn(
                buttonVariants({ size: "icon", variant: "outline" }),
              )}
              to={
                parseInt(surat?.number as string) === 114
                  ? "#"
                  : `/muslim/quran-word-by-word/${parseInt(surat?.number as string) + 1}`
              }
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Link>
          </div>
        </VirtualizedListSurah>
        <div className="">
          {/*{ayatKeys.map((key) => (*/}
          {[].map((key) => (
            <div key={key} className="group relative p-2.5 border-t">
              {/* Ayat Arab */}
              <div dir="rtl" className="break-normal pr-2.5">
                <div
                  className={cn("text-primary my-3 font-lpmq")}
                  style={{
                    fontWeight: opts.font_weight,
                    fontSize: font_size_opts?.fontSize || "1.5rem",
                    lineHeight: font_size_opts?.lineHeight || "3.5rem",
                  }}
                >
                  {surat.text[key]}
                  <span className="text-4xl inline-flex mx-1">
                    {toArabicNumber(key)}
                  </span>{" "}
                </div>
              </div>

              <div className="max-w-none prose prose-base leading-[26px] prose-gray dark:prose-invert whitespace-pre-wrap mb-2">
                {surat.translations.id.text[key]}
              </div>

              <details className="group [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center gap-1.5 outline-none">
                  <div className="group-open:animate-slide-left [animation-fill-mode:backwards] group-open:block hidden font-medium text-sm text-indigo-600 dark:text-indigo-400">
                    Hide Tafsir {surat.name_latin}:{key}{" "}
                  </div>
                  <div className="animate-slide-left group-open:hidden font-medium text-sm text-indigo-600 dark:text-indigo-400">
                    View Tafsir {surat.name_latin}:{key}{" "}
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
                  <p className="max-w-none leading-7 prose prose-base prose-gray dark:prose-invert whitespace-pre-wrap">
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
      </div>
    </React.Fragment>
  );
};

import { motion, useSpring, useScroll } from "framer-motion";

const VirtualizedListSurah = ({ children }: { children: React.ReactNode }) => {
  const [children1, children2] = React.Children.toArray(children);
  const surat = useLoaderData<typeof loader>();
  const items = Object.keys(surat.text); // Mendapatkan list nomor ayat
  const parentRef = React.useRef<HTMLDivElement>(null);
  const toAyatRef = React.useRef<number>(1);
  // Gunakan useVirtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 56, // Perkiraan tinggi item (70px)
  });

  const loaderRoot = useRouteLoaderData<typeof RootLoader>("root");
  const opts = loaderRoot?.opts || {};
  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);

  const virtualItems = rowVirtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1]; // Ambil item terakhir
  const lastItemBottom = lastItem ? lastItem.start + lastItem.size : 0; // Posisi akhir item terakhir

  const { scrollYProgress } = useScroll({
    container: parentRef,
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [lastRead, setLastRead] = useState<any | null>(null);
  const [bookmarks, setBookmarks] = React.useState<BookmarkType[]>([]);

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

  const save_bookmark_to_lf = async (bookmarks) => {
    await set_cache(BOOKMARK_KEY, bookmarks);
  };
  // Fungsi untuk toggle favorit
  const toggleBookmark = (key: string) => {
    const data_bookmark = {
      title: `${surat.name_latin}:${key}`,
      arab: surat.text[key],
      latin: "",
      tafsir: {
        source: surat.tafsir.id.kemenag.source,
        text: surat.tafsir.id.kemenag.text[key],
      },
      translation: surat.translations.id.text[key],
      source: `/muslim/quran/${surat.number}?ayat=${key}`,
    };
    const newBookmarks = save_bookmarks("ayat", data_bookmark, [...bookmarks]);

    const is_saved = bookmarks_ayah.find((fav) => fav.id === key);

    if (is_saved) {
      const _newBookmarks = bookmarks?.filter(
        (d) => d.created_at !== is_saved.created_at,
      );
      setBookmarks(_newBookmarks);

      save_bookmark_to_lf(_newBookmarks);
    } else {
      setBookmarks(newBookmarks);
      save_bookmark_to_lf(newBookmarks);
    }
  };

  const saveLastRead = async (lastRead) => {
    await set_cache(LASTREAD_KEY, lastRead);
  };
  // Tandai ayat sebagai terakhir dibaca
  const handleRead = (key: string) => {
    const id = `${surat.number}-${key}`;
    const data_bookmark = {
      id,
      title: `${surat.name_latin}:${key}`,
      arab: surat.text[key],
      latin: "",
      tafsir: {
        source: surat.tafsir.id.kemenag.source,
        text: surat.tafsir.id.kemenag.text[key],
      },
      translation: surat.translations.id.text[key],
      source: `/muslim/quran/${surat.number}?ayat=${key}`,
      created_at: new Date().toISOString(),
    };
    const isLastRead = lastRead?.id === id;
    console.warn("DEBUGPRINT[1]: quran.$id.tsx:451: isLastRead=", isLastRead);
    if (isLastRead) {
      setLastRead(null);
      saveLastRead(null);
    } else {
      setLastRead(data_bookmark);
      saveLastRead(data_bookmark);
    }
  };

  const scrollToAyat = (index: number) => {
    rowVirtualizer.scrollToIndex(index, {
      align: "start",
    });
  };

  const scrollToFirstAyat = () => {
    rowVirtualizer.scrollToIndex(0, {
      align: "center",
    });
  };

  const relativeTime = lastRead
    ? formatDistanceToNow(new Date(lastRead.created_at), {
        addSuffix: true,
        includeSeconds: true,
        locale: id,
      })
    : null;

  // useEffect(() => {
  //   if (surat?.ayat_number !== null) {
  //     setTimeout(() => {
  //       scrollToAyat(parseInt(surat?.ayat_number) + 1);
  //     }, 1000);
  //   }
  // }, [surat?.ayat_number]);

  const maxValue = items.length;
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

      <div className="relative z-[60] bg-gradient-to-r from-fuchsia-500 to-cyan-500 dark:from-fuchsia-400 dark:to-cyan-400 max-w-xl mx-auto">
        <PopoverTrigger>
          <Button
            variant="outline"
            size="icon"
            className="gap-2 absolute right-[87px] -mt-[45px] bg-background z-30 transition-all duration-300 data-[focused]:outline-none data-[focused]:ring-none data-[focused]:ring-0 data-[focus-visible]:outline-none data-[focus-visible]:ring-none data-[focus-visible]:ring-0"
          >
            <MoveDown />
          </Button>
          <Popover isNonModal={false} placement="bottom">
            <PopoverDialog className="max-w-[140px] space-y-1.5 mx-2 bg-background border rounded-md">
              {({ close }) => (
                <React.Fragment>
                  <NumberField
                    onChange={(value) => {
                      toAyatRef.current = value - 1;
                    }}
                    defaultValue={toAyatRef.current}
                    minValue={1}
                    maxValue={maxValue}
                  >
                    <Label>Pergi Ke Ayat</Label>
                    <FieldGroup>
                      <NumberFieldInput />
                      <NumberFieldSteppers />
                    </FieldGroup>
                  </NumberField>
                  <Button
                    className="w-full"
                    onPress={() => {
                      close();
                      scrollToAyat(toAyatRef.current);
                    }}
                  >
                    Submit
                  </Button>
                </React.Fragment>
              )}
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>
      </div>
      {/*<Button onPress={() => scrollToAyat(200)}>OK</Button>*/}
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
          className="divide-y"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {children1 && (
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
              {children1}
            </div>
          )}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const key = items[virtualRow.index];
            const isFavorite = bookmarks_ayah.some((fav) => fav.id === key);
            const id = `${surat.number}-${key}`;
            const isLastRead = lastRead?.id === id;

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
                  transform: `translateY(${virtualRow.start + (children ? 97 : 0)}px)`, // Tambahkan offset untuk children
                }}
              >
                <div
                  id={"quran" + surat.number + key}
                  key={key}
                  className="group relative p-3 mb-3"
                >
                  <div className="absolute flex justify-between w-full -translate-y-7 items-center max-w-[95%] mx-auto">
                    <div className="w-1/4">
                      <Badge
                        className="rounded-md bg-background w-fit"
                        variant="outline"
                      >
                        Ayat {key}
                      </Badge>
                    </div>
                    <div className="w-2/4 flex items-center justify-center">
                      {isLastRead ? (
                        <div
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "h-8 px-2 text-xs gap-1 mx-auto",
                          )}
                        >
                          <Bookmark
                            className={cn(
                              "fill-blue-500 text-blue-500 dark:text-blue-400 dark:fill-blue-400",
                            )}
                          />
                          <span className="truncate max-w-[135px]">
                            {relativeTime}
                          </span>
                        </div>
                      ) : (
                        <div />
                      )}
                    </div>

                    <div className="flex items-center gap-x-1 justify-end w-1/4">
                      {isFavorite && (
                        <Button
                          onPress={() => toggleBookmark(key)}
                          aria-label="Menu"
                          variant="outline"
                          size="icon"
                          className={cn("h-8 w-8")}
                        >
                          <Star
                            className={cn(
                              "fill-orange-500 text-orange-500 dark:text-orange-400 dark:fill-orange-400",
                            )}
                          />
                        </Button>
                      )}
                      <MenuTrigger>
                        <Button
                          aria-label="Menu"
                          variant="outline"
                          size="icon"
                          className={cn("h-8 w-8")}
                        >
                          <Ellipsis />
                        </Button>
                        <Popover
                          placement="left"
                          className=" bg-background p-1 w-44 overflow-auto rounded-md shadow-lg ring-1 ring-black ring-opacity-5 entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95 fill-mode-forwards origin-top-left"
                        >
                          <div className="px-2 py-1.5 text-sm font-semibold border-b mb-1">
                            {surat.name_latin} - Ayat {key}{" "}
                          </div>
                          <Menu className="outline-none">
                            <ActionItem
                              id="new"
                              onAction={() => toggleBookmark(key)}
                            >
                              <Star
                                className={cn(
                                  "mr-1 size-3",
                                  isFavorite &&
                                    "fill-orange-500 text-orange-500 dark:text-orange-400 dark:fill-orange-400",
                                )}
                              />
                              Bookmark
                            </ActionItem>
                            <ActionItem
                              id="open"
                              onAction={() => handleRead(key)}
                            >
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
                  <div dir="rtl" className="break-normal pr-2.5">
                    <div
                      className={cn("text-primary my-3 font-lpmq")}
                      style={{
                        fontWeight: opts.font_weight,
                        fontSize: font_size_opts?.fontSize || "1.5rem",
                        lineHeight: font_size_opts?.lineHeight || "3.5rem",
                      }}
                    >
                      {surat.text[key]}
                      <span className="text-4xl inline-flex mx-1 font-uthmani">
                        {toArabicNumber(Number(key))}
                      </span>{" "}
                    </div>
                  </div>

                  <div className="max-w-none prose prose-base leading-[26px] prose-gray dark:prose-invert whitespace-pre-wrap mb-2">
                    {surat.translations.id.text[key]}
                  </div>

                  <details className="group [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer items-center gap-1.5 outline-none">
                      <div className="group-open:animate-slide-left [animation-fill-mode:backwards] group-open:block hidden font-medium text-sm text-indigo-600 dark:text-indigo-400">
                        Tafsir {surat.name_latin}:{key}{" "}
                      </div>
                      <div className="animate-slide-left group-open:hidden font-medium text-sm text-indigo-600 dark:text-indigo-400">
                        Tafsir {surat.name_latin}:{key}{" "}
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
                      <p className="max-w-none leading-7 prose prose-base prose-gray dark:prose-invert whitespace-pre-wrap">
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
              </div>
            );
          })}

          {children2 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${lastItemBottom + (children2 ? 93 : 0)}px)`, // Tambahkan offset untuk children
                paddingBottom: "15px",
              }}
            >
              {children2}
            </div>
          )}
        </div>
      </div>
      <ScrollToFirstIndex handler={scrollToFirstAyat} container={parentRef} />
    </React.Fragment>
  );
};

export default SuratDetail;
