import { Link, data as wrapper, useNavigate } from "react-router";
import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import type { Route } from "./+types/index";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Search,
  Github,
  Star,
  BookOpen,
  BookOpenText,
  Feather,
  Scroll,
  Bookmark,
  Heart,
  Ellipsis,
  Check,
  CircleCheckBig,
  X,
  Dot,
  Sun,
  Moon,
  Monitor,
  Settings2,
} from "lucide-react";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/hudamnhd/todo-list-2/refs/heads/main/public/quran/surat/${params.id}.json`,
  );
  const result = await res.json();
  if (!result.data) {
    throw new Response("Not Found", { status: 404 });
  }

  const initialPage = Array.from(
    new Set(result.data.map((ayat) => ayat.page_number)),
  );
  const data = { data: result.data, initialPage: initialPage[0] };
  return wrapper(data, {
    headers: {
      "Cache-Control": "public, max-age=31560000, immutable",
    },
  });
};

import localforage from "localforage";
export default function Index({ loaderData }: Route.ComponentProps) {
  const { data, initialPage } = loaderData;
  const [favorites, setFavorites] = useState<Array>([]);
  const [lastRead, setLastRead] = useState<number | null>(null);
  const navigate = useNavigate();

  // Ambil semua nomor halaman unik dari data ayat
  const allPageNumbers = Array.from(
    new Set(data.map((ayat) => ayat.page_number)),
  );
  const [currentPage, setCurrentPage] = useState(initialPage);
  // allPageNumbers?.length > 0 ? allPageNumbers[0] : 1,
  const totalPagesSurat = allPageNumbers.length;
  const totalPages = 604;

  // Filter ayat berdasarkan halaman yang dipilih
  const filteredData = data.filter((ayat) => ayat.page_number === currentPage);
  useEffect(() => {
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
  const last_surah = data[data.length - 1];
  const start_surah = data[0];
  const nextPage = () => {
    if (last_surah.page_number === currentPage) {
      navigate(`/muslim/quran-surat/${last_surah.sura_id + 1}`, {
        preventScrollReset: false,
      });
    }
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fungsi untuk pindah ke halaman sebelumnya
  const prevPage = () => {
    if (start_surah.page_number === currentPage) {
      navigate(`/muslim/quran-surat/${start_surah.sura_id - 1}`, {
        preventScrollReset: false,
      });
    }
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <ul role="list" className="">
      {/*<DisplayTrigger key={currentPage} />*/}
      {filteredData.map((ayat, index) => {
        const isFavorite = favorites.some((fav) => fav.aya_id === ayat.aya_id);
        const isLastRead = lastRead?.aya_id === ayat.aya_id;

        return (
          <li
            key={ayat.aya_id}
            className={`group relative py-5 pr-4 pl-2 sm:px-5 hover:bg-accent rounded-md ${
              isLastRead ? "bg-muted" : ""
            }`}
          >
            <div className=" w-full text-right flex gap-x-2.5 items-start justify-end">
              <div className="grid gap-1">
                <Badge className="rounded px-2">{ayat.aya_number}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger className="group-hover:visible invisible h-auto">
                    <Ellipsis className="fill-primary w-5 h-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Action</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => toggleFavorite(ayat)}>
                      <Heart className="w-4 h-4" /> Favorite
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRead(ayat)}>
                      <Bookmark className="w-4 h-4" /> Last read
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="relative mt-2 font-lpmq text-right">
                {ayat.aya_text}
              </p>
            </div>
            <div className="translation-text mt-3 flex items-end justify-end">
              <div
                className="text-sm text-muted-foreground text-right sm:max-w-[80%] "
                dangerouslySetInnerHTML={{
                  __html: ayat.translation_aya_text,
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
          disabled={currentPage === 1}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <span className="text-sm text-muted-foreground">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </ul>
  );
}
