import cache from "#app/utils/cache-server.ts";
import { toast } from "sonner";
import { AutosizeTextarea } from "#app/components/ui/autosize-textarea.tsx";
import { cn } from "#app/utils/misc.tsx";
import { Link, useLoaderData, useRouteLoaderData } from "@remix-run/react";
import React, { useState, useEffect } from "react";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import { Button, buttonVariants } from "#app/components/ui/button";
import {
  ChevronLeft,
  Send,
  Check,
  X,
  ChevronRight,
  Bookmark,
  Heart,
  Ellipsis,
  Dot,
  Minus,
  BookOpen,
} from "lucide-react";
import ky from "ky";
import { data as daftar_surat } from "#app/constants/daftar-surat.json";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { save_bookmarks } from "#app/utils/bookmarks";

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

const BOOKMARK_KEY = "BOOKMARK";
const LASTREAD_KEY = "LASTREAD";

import { fontSizeOpt } from "#/app/constants/prefs";

const getCorrectAnswerCount = () => {
  const storedData = JSON.parse(
    localStorage.getItem("ayatCheckerData") || "{}",
  );
  const correctAnswers = Object.values(storedData).filter(
    (entry: any) => entry.isCorrect === true,
  );
  console.warn(
    "DEBUGPRINT[1]: quran-test.$id.tsx:112: correctAnswers=",
    storedData,
  );
  return correctAnswers.length;
};

const JSONDATA = {
  data: [
    {
      aya_id: 1,
      aya_number: 1,
      aya_text:
        // "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u0670\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0652\u0645\u0650\u06d9",
        "\u0635\u0650\u0631\u064e\u0627\u0637\u064e \u0627\u0644\u0651\u064e\u0630\u0650\u064a\u0652\u0646\u064e \u0627\u064e\u0646\u0652\u0639\u064e\u0645\u0652\u062a\u064e \u0639\u064e\u0644\u064e\u064a\u0652\u0647\u0650\u0645\u0652 \u06d5\u06d9 \u063a\u064e\u064a\u0652\u0631\u0650 \u0627\u0644\u0652\u0645\u064e\u063a\u0652\u0636\u064f\u0648\u0652\u0628\u0650 \u0639\u064e\u0644\u064e\u064a\u0652\u0647\u0650\u0645\u0652 \u0648\u064e\u0644\u064e\u0627 \u0627\u0644\u0636\u0651\u064e\u0627\u06e4\u0644\u0650\u0651\u064a\u0652\u0646\u064e\u08d6",
      sura_id: 1,
      juz_id: 1,
      page_number: 1,
      translation_aya_text:
        "<p>Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.</p>",
    },
    {
      aya_id: 2,
      aya_number: 2,
      aya_text:
        "\u0627\u064e\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u0670\u0647\u0650 \u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0652\u0639\u0670\u0644\u064e\u0645\u0650\u064a\u0652\u0646\u064e\u06d9",
      sura_id: 1,
      juz_id: 1,
      page_number: 1,
      translation_aya_text: "Segala puji bagi Allah, Tuhan seluruh alam,",
    },
    {
      aya_id: 3,
      aya_number: 3,
      aya_text:
        "\u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0652\u0645\u0650\u06d9",
      sura_id: 1,
      juz_id: 1,
      page_number: 1,
      translation_aya_text: "Yang Maha Pengasih, Maha Penyayang,",
    },
    {
      aya_id: 4,
      aya_number: 4,
      aya_text:
        "\u0645\u0670\u0644\u0650\u0643\u0650 \u064a\u064e\u0648\u0652\u0645\u0650 \u0627\u0644\u062f\u0651\u0650\u064a\u0652\u0646\u0650\u06d7",
      sura_id: 1,
      juz_id: 1,
      page_number: 1,
      translation_aya_text: "Pemilik hari pembalasan.",
    },
    {
      aya_id: 5,
      aya_number: 5,
      aya_text:
        "\u0627\u0650\u064a\u0651\u064e\u0627\u0643\u064e \u0646\u064e\u0639\u0652\u0628\u064f\u062f\u064f \u0648\u064e\u0627\u0650\u064a\u0651\u064e\u0627\u0643\u064e \u0646\u064e\u0633\u0652\u062a\u064e\u0639\u0650\u064a\u0652\u0646\u064f\u06d7",
      sura_id: 1,
      juz_id: 1,
      page_number: 1,
      translation_aya_text:
        "Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami mohon pertolongan.",
    },
    {
      aya_id: 6,
      aya_number: 6,
      aya_text:
        "\u0627\u0650\u0647\u0652\u062f\u0650\u0646\u064e\u0627 \u0627\u0644\u0635\u0651\u0650\u0631\u064e\u0627\u0637\u064e \u0627\u0644\u0652\u0645\u064f\u0633\u0652\u062a\u064e\u0642\u0650\u064a\u0652\u0645\u064e \u06d9",
      sura_id: 1,
      juz_id: 1,
      page_number: 1,
      translation_aya_text: "Tunjukilah kami jalan yang lurus,",
    },
    {
      aya_id: 7,
      aya_number: 7,
      aya_text:
        "\u0635\u0650\u0631\u064e\u0627\u0637\u064e \u0627\u0644\u0651\u064e\u0630\u0650\u064a\u0652\u0646\u064e \u0627\u064e\u0646\u0652\u0639\u064e\u0645\u0652\u062a\u064e \u0639\u064e\u0644\u064e\u064a\u0652\u0647\u0650\u0645\u0652 \u06d5\u06d9 \u063a\u064e\u064a\u0652\u0631\u0650 \u0627\u0644\u0652\u0645\u064e\u063a\u0652\u0636\u064f\u0648\u0652\u0628\u0650 \u0639\u064e\u0644\u064e\u064a\u0652\u0647\u0650\u0645\u0652 \u0648\u064e\u0644\u064e\u0627 \u0627\u0644\u0636\u0651\u064e\u0627\u06e4\u0644\u0650\u0651\u064a\u0652\u0646\u064e \u08d6",
      sura_id: 1,
      juz_id: 1,
      page_number: 1,
      translation_aya_text:
        "(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat.",
    },
  ],
};

const SYMBOLS = {
  آ: "ا",
  أ: "ا",
  إ: "ا",
  ا: "ا",
  ٱ: "ا",
  ٲ: "ا",
  ٳ: "ا",
  ؤ: "و",
  ئ: "ى",
  ؽ: "ؽ",
  ؾ: "ؾ",
  ؿ: "ؿ",
  ي: "ى",
  ب: "ب",
  ت: "ت",
  ؠ: "ؠ",
  ة: "ه",
  ث: "ث",
  ج: "ج",
  ح: "ح",
  خ: "خ",
  د: "د",
  ذ: "ذ",
  ر: "ر",
  ز: "ز",
  س: "س",
  ش: "ش",
  ص: "ص",
  ض: "ض",
  ط: "ط",
  ظ: "ظ",
  ع: "ع",
  غ: "غ",
  ػ: "ک",
  ؼ: "ک",
  ف: "ف",
  ق: "ق",
  ك: "ك",
  ګ: "ك",
  ڬ: "ك",
  ڭ: "ڭ",
  ڮ: "ك",
  ل: "ل",
  م: "م",
  ن: "ن",
  ه: "ه",
  و: "و",
  ى: "ى",
  ٸ: "ى",
  ٵ: "ءا", // hamza alef?
  ٶ: "ءو", // hamza waw?
  ٹ: "ٹ",
  ٺ: "ٺ",
  ٻ: "ٻ",
  ټ: "ت",
  ٽ: "ت",
  پ: "پ",
  ٿ: "ٿ",
  ڀ: "ڀ",
  ځ: "ءح",
  ڂ: "ح",
  ڃ: "ڃ",
  ڄ: "ڄ",
  څ: "ح",
  چ: "چ",
  ڇ: "ڇ",
  ڈ: "ڈ",
  ډ: "د",
  ڊ: "د",
  ڋ: "د",
  ڌ: "ڌ",
  ڍ: "ڍ",
  ڎ: "ڎ",
  ڏ: "د",
  ڐ: "د",
  ڑ: "ڑ",
  ڒ: "ر",
  ړ: "ر",
  ڔ: "ر",
  ڕ: "ر",
  ږ: "ر",
  ڗ: "ر",
  ژ: "ژ",
  ڙ: "ڙ",
  ښ: "س",
  ڛ: "س",
  ڜ: "س",
  ڝ: "ص",
  ڞ: "ص",
  ڟ: "ط",
  ڠ: "ع",
  ڡ: "ڡ",
  ڢ: "ڡ",
  ڣ: "ڡ",
  ڤ: "ڤ",
  ڥ: "ڡ",
  ڦ: "ڦ",
  ڧ: "ق",
  ڨ: "ق",
  ک: "ک",
  ڪ: "ڪ",
  گ: "گ",
  ڰ: "گ",
  ڱ: "ڱ",
  ڲ: "گ",
  ڳ: "ڳ",
  ڴ: "گ",
  ڵ: "ل",
  ڶ: "ل",
  ڷ: "ل",
  ڸ: "ل",
  ڹ: "ن",
  ں: "ں",
  ڻ: "ڻ",
  ڼ: "ن",
  ڽ: "ن",
  ھ: "ه",
  ڿ: "چ",
  ۀ: "ه",
  ہ: "ہ",
  ۂ: "ءہ",
  ۃ: "ہ",
  ۄ: "و",
  ۅ: "ۅ",
  ۆ: "ۆ",
  ۇ: "ۇ",
  ۈ: "ۈ",
  ۉ: "ۉ",
  ۊ: "و",
  ۋ: "ۋ",
  ی: "ی",
  ۍ: "ي",
  ێ: "ي",
  ۏ: "و",
  ې: "ې",
  ۑ: "ي",
  ے: "ے",
  ۓ: "ے",
  ە: "ە",
  ۺ: "ش",
  ۻ: "ض",
  ۼ: "ۼ",
  ۿ: "ه",
};

function removeDiacritics(text) {
  const symbols = [...text];
  const result = [];
  for (const symbol of symbols) {
    if (SYMBOLS[symbol]) {
      result.push(symbol);
    }
  }
  return result.join("");
}

const removeHarakat = (text: string): string => {
  return text.replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED\u08d6]/g, "");
};
export default function Index() {
  const renderCount = React.useRef(0);
  const correctCountRef = React.useRef(0);
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

    correctCountRef.current = getCorrectAnswerCount();
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
      {/*<pre className="font-lpmq">{JSON.stringify(JSONDATA, null, 2)}</pre>*/}
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
      {Object.values(group_surat).map((d) => {
        const first_ayah = d.ayat[0]?.ayah;
        const last_ayah = d.ayat[d.ayat.length - 1]?.ayah;
        return (
          <React.Fragment key={d.surah.number}>
            <div className="prose dark:prose-invert max-w-none">
              <React.Fragment>
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

                {correctCountRef?.current > 0 && (
                  <div className="text-center mb-2">
                    <div className="font-semibold text-lg">
                      Jumlah ayat yang benar: {correctCountRef?.current}{" "}
                    </div>
                  </div>
                )}
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
                            {/*{removeHarakat(dt.arab)}*/}
                            {dt.arab}
                          </div>
                        </div>

                        <Exercise
                          arab={dt.arab}
                          surat={d.surah.number}
                          ayat={dt.ayah}
                          page={dt.page}
                        />
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
          to={`/muslim/quran-test/${parseInt(id) - 1}`}
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
          to={`/muslim/quran-test/${parseInt(id) + 1}`}
          disabled={parseInt(id) === 604}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight />
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

const levenshteinDistance = (a: string, b: string): number => {
  const dp: number[][] = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[a.length][b.length];
};

const highlightDiff = (target: string, input: string) => {
  const targetArr = target.split("");
  const inputArr = input.split("");
  let diffResult = "";

  for (let i = 0; i < targetArr.length; i++) {
    if (targetArr[i] !== inputArr[i]) {
      diffResult += `<span class="bg-destructive">${inputArr[i] || "_"}</span>`;
    } else {
      diffResult += `<span class="text-destructive">${inputArr[i] || "_"}</span>`;
    }
  }
  return diffResult;
};

const Exercise: React.FC<{
  arab: string;
  surat: string;
  ayat: string;
  page: string;
}> = ({ arab, surat, ayat, page }) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>({
    value: "",
    isCorrect: false,
  });
  const [diffHtml, setDiffHtml] = React.useState<string | null>(null);

  const handleCheck = (surat: string, ayat: string, page: string) => {
    if (textareaRef.current) {
      const inputValue = textareaRef.current.value.trim().replace(/ +/g, " "); // Normalisasi spasi
      if (inputValue === "") {
        return toast.warning("Error - Please input ayat.");
      }
      const expectedValue = arab.trim().replace(/ +/g, " "); // Normalisasi spasi target

      const distance = levenshteinDistance(expectedValue, inputValue);
      const similarityPercentage =
        ((expectedValue.length - distance) / expectedValue.length) * 100;

      const isCorrect = similarityPercentage >= 90; // Toleransi 90% dianggap benar

      // Ambil data yang sudah ada di local storage
      const storedData = JSON.parse(
        localStorage.getItem("ayatCheckerData") || "{}",
      );

      // Update object dengan input baru dan hasil pengecekan
      const updatedData = {
        ...storedData,
        [`${page}${surat}${ayat}`]: {
          value: inputValue,
          isCorrect: isCorrect, // Simpan status pengecekan
        },
      };

      // Simpan kembali ke local storage
      localStorage.setItem("ayatCheckerData", JSON.stringify(updatedData));

      if (isCorrect) {
        if (textareaRef.current) {
          textareaRef.current = {
            value: inputValue,
            isCorrect: isCorrect,
          };
        }
        toast.success("Benar! - Teks sesuai dengan ayat.");
        setDiffHtml(null);
      } else {
        toast.error("Salah - Silakan periksa kembali.");
        const diff = highlightDiff(expectedValue, inputValue);
        setDiffHtml(diff);
      }
    }
  };

  React.useEffect(() => {
    const storedData = JSON.parse(
      localStorage.getItem("ayatCheckerData") || "{}",
    );
    const key = `${page}${surat}${ayat}`;
    if (storedData[key] && textareaRef.current) {
      textareaRef.current = storedData[key]; // Isi textarea dengan data yang sudah disimpan
    }
  }, [page, surat, ayat]);
  return (
    <div className="flex flex-col gap-3 items-end">
      {diffHtml && (
        <span
          dir="rtl"
          className="font-lpmq text-right text-destructive-foreground border border-destructive px-2 rounded-md "
          dangerouslySetInnerHTML={{ __html: diffHtml }}
        />
      )}

      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border shadow-sm focus-within:border-blue-600 dark:focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-600 dark:focus-within:ring-blue-400 w-full",
          textareaRef.current.isCorrect &&
            "bg-gradient-to-r from-teal-400 to-lime-500 dark:from-teal-700 dark:to-lime-600",
        )}
      >
        <AutosizeTextarea
          defaultValue={textareaRef.current.value}
          disabled={textareaRef.current.isCorrect}
          onChange={(e) => {
            textareaRef.current.value = e.target.value;
          }}
          dir="rtl"
          placeholder={arab}
          className={cn(
            "font-lpmq border-none resize-none disabled:opacity-100",
            textareaRef.current.isCorrect &&
              "bg-gradient-to-r from-teal-200 to-lime-200 dark:from-teal-800 dark:to-lime-800",
          )}
        />

        {!textareaRef.current.isCorrect && (
          <div className="flex items-center justify-end gap-2 bg-background p-3">
            <Button
              onPress={() => handleCheck(surat, ayat, page)}
              variant="outline"
              isDisabled={textareaRef.current.isCorrect}
              size="icon"
            >
              <Send />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
