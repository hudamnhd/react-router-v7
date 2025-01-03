import { cn } from "#app/utils/misc.tsx";
import {
  useFetcher,
  Link,
  useParams,
  useNavigate,
  useLoaderData,
  useRouteLoaderData,
} from "@remix-run/react";

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
  Plus,
  X,
  BookOpen,
} from "lucide-react";
import Loader from "#app/components/ui/loader";
import ky from "ky";
import { data as daftar_surat } from "#app/constants/daftar-surat.json";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";

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
    <div className="prose dark:prose-invert max-w-xl mx-auto border-x divide-y">
      <div className="p-1.5 flex justify-end">
        <DisplaySetting opts={opts} />
      </div>

      {Object.values(group_surat).map((d) => {
        const first_ayah = d.ayat[0]?.ayah;
        const last_ayah = d.ayat[d.ayat.length - 1]?.ayah;
        return (
          <React.Fragment key={d.surah.number}>
            <div className="prose dark:prose-invert max-w-none">
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
                        "fixed z-50 w-full bg-background sm:rounded-md inset-x-0 bottom-0 px-2 pb-4 outline-none sm:max-w-3xl mx-auto max-h-screen",
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

                          <div className="max-h-[65vh] overflow-y-auto">
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
                                Your browser does not support the audio element.
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

              <div
                className="rtl:text-justify leading-relaxed sm:px-6 sm:pb-6 p-3"
                dir="rtl"
              >
                {d.ayat.map((dt) => (
                  <span
                    key={dt.id}
                    className="text-primary font-lpmq inline"
                    style={{
                      fontWeight: opts.font_weight,
                      fontSize: font_size_opts?.fontSize || "1.5rem",
                      lineHeight: font_size_opts?.lineHeight || "3.5rem",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {dt.arab}
                    <span className="text-4xl inline-block mx-1">
                      {toArabicNumber(dt.ayah)}
                    </span>{" "}
                  </span>
                ))}
              </div>
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
          to={`/muslim/quran/v2/${parseInt(id) - 1}`}
          disabled={parseInt(id) === 1}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon />
        </Link>

        <span className="text-accent-foreground mt-2 sm:mt-0">
          Halaman <strong>{id}</strong> dari <strong>604</strong>
        </span>
        <Link
          className={cn(
            buttonVariants({ size: "icon", variant: "outline" }),
            "mt-2 sm:mt-0",
          )}
          to={`/muslim/quran/v2/${parseInt(id) + 1}`}
          disabled={parseInt(id) === 604}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon />
        </Link>
      </div>
    </div>
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
