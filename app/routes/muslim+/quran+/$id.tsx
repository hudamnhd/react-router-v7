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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#app/components/ui/dropdown-menu";
import { Badge } from "#app/components/ui/badge";
import { Button } from "#app/components/ui/button";
import { Bookmark, Heart, Ellipsis } from "lucide-react";
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

import { getCache, setCache } from "#app/utils/cache-client.ts";
const FAVORITES_KEY = "FAVORITES";
const LASTVISIT_KEY = "LASTVISIT";
const LASTREAD_KEY = "LASTREAD";

export default function Index() {
  const params = useParams();
  const fetcher = useFetcher({ key: params.id });
  const ayat = fetcher.data?.ayat;
  const surat = fetcher.data?.surat;
  const [favorites, setFavorites] = useState<Array>([]);
  const [lastRead, setLastRead] = useState<number | null>(null);
  const navigate = useNavigate();

  // Ambil semua nomor halaman unik dari data ayat

  // const total_ayat = surat ? surat?.number_of_verses : null;
  // const last_ayat = ayat ? ayat[ayat.length - 1].ayah : null;
  // Filter ayat berdasarkan halaman yang dipilih
  useEffect(() => {
    fetcher.load(`/resources/quran/page/${params.id}`);
    const loadFavorites = async () => {
      if (surat) {
        await setCache(LASTVISIT_KEY, surat);
      }

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
  }, [params.id]);

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

  // Fungsi untuk pindah ke halaman berikutnya
  const nextPage = () => {
    navigate(`/muslim/quran/${parseInt(params.id) + 1}`, {
      preventScrollReset: true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fungsi untuk pindah ke halaman sebelumnya
  const prevPage = () => {
    navigate(`/muslim/quran/${parseInt(params.id) - 1}`, {
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
        {ayat.map((d) => {
          const isFavorite = favorites.some((fav) => fav.id === d.id);
          const isLastRead = lastRead?.id === d.id;

          return (
            <li
              key={d.id}
              className={`group relative py-5 pr-4 pl-2 sm:px-5 hover:bg-accent rounded-md ${
                isLastRead ? "bg-accent" : ""
              }`}
            >
              <div className=" w-full text-right flex gap-x-2.5 items-start justify-end">
                <div className="grid gap-1">
                  <Badge className="rounded px-2">{d.ayah}</Badge>
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
                    <Heart className="fill-destructive dark:fill-red-400 dark:text-red-400 text-destructive w-5 h-5" />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {/* Pagination Controls */}
      <div className="ml-auto flex items-center justify-center gap-3 my-5">
        <Button
          onClick={prevPage}
          disabled={parseInt(params.id) === 1}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <span className="text-sm text-muted-foreground">
          Halaman <strong>{params.id}</strong> dari <strong>604</strong>
        </span>
        <Button
          onClick={nextPage}
          disabled={parseInt(params.id) === 604}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
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
