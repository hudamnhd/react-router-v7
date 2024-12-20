import {
  useFetcher,
  useParams,
  useNavigate,
  useLoaderData,
} from "@remix-run/react";
import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#app/components/ui/popover";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#app/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#app/components/ui/dropdown-menu";
import { Badge } from "#app/components/ui/badge";
import { Button } from "#app/components/ui/button";
import { Bookmark, Heart, Ellipsis, X } from "lucide-react";

// export function headers(_: Route.HeadersArgs) {
//   return {
//     "Cache-Control": "public, max-age=31560000, immutable",
//   };
// }

import localforage from "localforage";

import { ChevronsUpDown } from "lucide-react";

import { Spinner } from "#app/components/ui/spinner";

const SpinnerFull = () => {
  return (
    <div className="absolute h-full w-full flex items-center justify-center bottom-0 left-1/2 transform -translate-x-1/2  z-20 backdrop-blur-[1px] rounded-xl">
      <div className="flex justify-center">
        <Spinner>Loading...</Spinner>
      </div>
    </div>
  );
};
export default function Index() {
  const fetcher = useFetcher();
  const ayat = fetcher.data?.ayat;
  const surat = fetcher.data?.surat;
  const params = useParams();
  const [favorites, setFavorites] = useState<Array>([]);
  const [lastRead, setLastRead] = useState<number | null>(null);
  const navigate = useNavigate();

  // Ambil semua nomor halaman unik dari data ayat
  const totalPagesSurat = 1;
  const totalPages = 604;

  // Filter ayat berdasarkan halaman yang dipilih
  useEffect(() => {
    fetcher.load(`/resources/quran/page/${params.id}`);
    const loadFavorites = async () => {
      const storedFavorites = await localforage.getItem("favorites");
      if (storedFavorites) {
        setFavorites(storedFavorites);
      }
    };

    const loadLastRead = async () => {
      const storedLastRead = await localforage.getItem("lastRead");
      if (storedLastRead !== null) {
        setLastRead(storedLastRead);
      }
    };

    loadFavorites();

    loadLastRead();
  }, []);

  // Simpan data favorit ke localForage
  // useEffect(() => {
  //   const persistedValue = window.localStorage.getItem("page_number");
  //   setCurrentPage(
  //     persistedValue !== null ? JSON.parse(persistedValue) : initialPage,
  //   );
  //   if (persistedValue) {
  //     window.localStorage.removeItem("page_number");
  //   }
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }, [initialPage]);
  // Simpan data favorit ke localForage
  useEffect(() => {
    const saveFavorites = async (favorites) => {
      // await localforage.setItem<Set<number>>("favorites", favorites);
    };
    saveFavorites(favorites);
  }, [favorites]);

  // Simpan ayat terakhir dibaca ke localForage

  useEffect(() => {
    if (lastRead !== null) {
      const saveLastRead = async (lastRead) => {
        await localforage.setItem<Set<number>>("lastRead", lastRead);
      };
      saveLastRead(lastRead);
    }
  }, [lastRead]);

  // Fungsi untuk toggle favorit
  const toggleFavorite = (ayat: Ayat) => {
    const isFavorite = favorites.some((fav) => fav.aya_id === ayat.aya_id);

    if (isFavorite) {
      // Hapus ayat dari favorites
      setFavorites(favorites.filter((fav) => fav.aya_id !== ayat.aya_id));
    } else {
      // Tambahkan ayat ke favorites
      setFavorites([...favorites, ayat]);
    }
  };

  // Tandai ayat sebagai terakhir dibaca
  const handleRead = (ayat) => {
    setLastRead(ayat); // Set ayat yang terakhir dibaca
  };

  // Fungsi untuk pindah ke halaman berikutnya
  const nextPage = () => {
    navigate(`/muslim/quran-surat/`, {
      preventScrollReset: false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fungsi untuk pindah ke halaman sebelumnya
  const prevPage = () => {
    navigate(`/muslim/quran-surat/`, {
      preventScrollReset: false,
    });
  };

  if (!fetcher.data || fetcher.state !== "idle") return <SpinnerFull />;

  return (
    <div className="prose dark:prose-invert max-w-none">
      <Popover>
        <PopoverTrigger className="w-fit mx-auto flex items-center justify-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            {surat.name_id}
            <span className="ml-2 underline-offset-4 group-hover:underline font-lpmq">
              ( {surat.name_short} )
            </span>
          </h1>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <SuratDetail data={surat} />
        </PopoverContent>
      </Popover>

      <ul role="list" className="">
        {/*<DisplayTrigger key={currentPage} />*/}
        {ayat.map((d, index) => {
          const isFavorite = favorites.some((fav) => fav.aya_id === d.id);
          const isLastRead = lastRead?.aya_id === d.id;

          return (
            <li
              key={d.id}
              className={`group relative py-5 pr-4 pl-2 sm:px-5 hover:bg-accent rounded-md ${
                isLastRead ? "bg-muted" : ""
              }`}
            >
              <div className=" w-full text-right flex gap-x-2.5 items-start justify-end">
                <div className="grid gap-1">
                  <Badge className="rounded px-2">{d.id}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="group-hover:visible invisible h-auto">
                      <Ellipsis className="fill-primary w-5 h-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Action</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toggleFavorite(d)}>
                        <Heart className="mr-2 w-4 h-4" /> Favorite
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRead(d)}>
                        <Bookmark className="mr-2 w-4 h-4" /> Last read
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="relative mt-2 font-lpmq text-right">{d.arab}</p>
              </div>
              <div className="translation-text mt-3 flex items-end justify-end">
                <div
                  className="text-sm text-muted-foreground text-right sm:max-w-[80%] "
                  dangerouslySetInnerHTML={{
                    __html: d.latin,
                  }}
                />
              </div>
              <div className="translation-text mt-3 flex items-end justify-end">
                <div
                  className="text-sm text-muted-foreground text-right sm:max-w-[80%] "
                  dangerouslySetInnerHTML={{
                    __html: d.text,
                  }}
                />
              </div>

              {(isLastRead || isFavorite) && (
                <div className="w-full text-right flex gap-x-2.5 items-center justify-end mt-2">
                  {isLastRead && <Bookmark className="fill-primary w-5 h-5" />}
                  {isFavorite && (
                    <Heart className="fill-destructive text-destructive w-5 h-5" />
                  )}
                </div>
              )}
            </li>
          );
        })}
        {/* Pagination Controls */}
        <div className="ml-auto flex items-center justify-center gap-3 my-3">
          <Button
            onClick={prevPage}
            // disabled={currentPage === 1}
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          {/*<span className="text-sm text-muted-foreground">
            Halaman <strong>{currentPage}</strong> dari{" "}
            <strong>{totalPages}</strong>
          </span>*/}
          <Button
            onClick={nextPage}
            // disabled={currentPage === totalPages}
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </ul>
    </div>
  );
}

const SuratDetail = ({ data }: { data: any }) => {
  return (
    <div className="max-w-2xl mx-auto p-6 border shadow-lg rounded-lg prose dark:prose-invert">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{data.name_id}</h1>
          <h2 className="text-sm italic">{data.name_en}</h2>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold font-lpmq-2">{data.name_short}</p>
          <p className="text-sm font-lpmq-2">{data.name_long}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm">
          Revelation: {data.revelation_en} ({data.revelation_id})
        </p>
        <p className="text-sm">Sequence: {data.sequence}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold">Translation</h3>
        <p className="text-sm">
          {data.translation_id} ({data.translation_en})
        </p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold ">Tafsir</h3>
        <p className="prose-sm">{data.tafsir}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold ">Audio</h3>
        <audio controls className="w-full">
          <source src={data.audio_url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>

      <div className="flex justify-between mt-6">
        <div>
          <p className="text-sm">Number of Verses: {data.number_of_verses}</p>
        </div>
        <div>
          <p className="text-sm">Surah Number: {data.number}</p>
        </div>
      </div>
    </div>
  );
};
