import { cn } from "#app/utils/misc.tsx";
import {
  useFetcher,
  useParams,
  useNavigate,
  useLoaderData,
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

import { getCache, setCache } from "#app/utils/cache-client.ts";
const FAVORITES_KEY = "FAVORITES";
const LASTVISIT_KEY = "LASTVISIT";
const LASTREAD_KEY = "LASTREAD";

export default function Index() {
  const params = useParams();
  const fetcher = useFetcher({ key: params.id });
  const [favorites, setFavorites] = useState<Array>([]);
  const [lastRead, setLastRead] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetcher.load(`/resources/quran/page/${params.id}`);
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

  if (!fetcher.data || fetcher.state !== "idle") return <Loader />;

  return (
    <div className="prose dark:prose-invert max-w-4xl mx-auto border-x divide-y">
      {Object.values(fetcher.data?.group_surat).map((d) => {
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
                        Hal {params.id}
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
              {/*<Dialog.Root>
                <Dialog.Trigger asChild>
                  <div className="text-3xl font-bold md:text-4xl w-fit mx-auto mt-2 mb-3">
                    {d.surah.name_id}
                    <span className="ml-2 underline-offset-4 group-hover:underline font-lpmq">
                      ( {d.surah.name_short} )
                    </span>
                    <div className="flex items-center text-base font-medium justify-center">
                      Hal {params.id}
                      <Dot />
                      <span>Ayat {first_ayah}</span>
                      <Minus />
                      <span>{last_ayah}</span>
                    </div>
                  </div>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
                  <Dialog.Content className="fixed z-50 w-full bg-background sm:rounded-md inset-x-0 bottom-0 rounded-t-xl px-4 pb-4 outline-none space-y-2.5 sm:max-w-3xl mx-auto">
                    <Dialog.Close className="flex items-center justify-center w-full outline-none">
                      <div className="mx-auto mt-4 mb-4 h-2 w-[100px] rounded-full bg-muted" />
                    </Dialog.Close>
                    <p className="-translate-y-0 text-xl sm:text-2xl font-semibold font-lpmq-2 text-center mb-1.5">
                      {d.surah.name_long}
                    </p>
                    <Dialog.Title>
                      {d.surah.number}. {d.surah.name_id}
                      <span className="ml-2 font-normal">
                        ( {d.surah.translation_id} )
                      </span>
                    </Dialog.Title>

                    <Dialog.Description className="flex items-center text-muted-foreground gap-1">
                      <span>{d.surah.revelation_id}</span>
                      <div className="w-2 relative">
                        <Dot className="absolute -left-2 -top-3" />
                      </div>
                      <span>{d.surah.number_of_verses} ayat</span>
                    </Dialog.Description>

                    <div className="max-h-[70vh] overflow-y-auto">
                      <div className="mb-4">
                        <h3 className="font-bold text-lg">Tafsir</h3>
                        <p className="prose max-w-none">{d.surah.tafsir}</p>
                      </div>

                      <div className="mb-4">
                        <h3 className="font-bold mb-1">Audio</h3>
                        <audio controls className="w-full">
                          <source src={d.surah.audio_url} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                    <Dialog.Close className="flex items-center justify-center w-full outline-none">
                      <Button variant="outline" className="w-full">
                        <X />
                        Close
                      </Button>
                    </Dialog.Close>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>*/}

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
                              <span className="text-lg font-medium text-gray-900 dark:text-white">
                                Ayat {dt.ayah}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
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
                              <Popover className=" bg-background p-1 w-56 overflow-auto rounded-md shadow-lg ring-1 ring-black ring-opacity-5 entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95 fill-mode-forwards origin-top-left">
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
                          <div className="relative font-lpmq text-right text-primary my-5">
                            {dt.arab}
                          </div>
                        </div>
                        <div className="translation-text">
                          <div
                            className="max-w-none prose-normal duration-300 text-muted-foreground mb-2"
                            dangerouslySetInnerHTML={{
                              __html: dt.latin,
                            }}
                          />
                        </div>
                        <div className="translation-text">
                          <div
                            className="max-w-none prose text-accent-foreground"
                            dangerouslySetInnerHTML={{
                              __html: dt.text,
                            }}
                          />
                        </div>
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
        <Button
          onClick={prevPage}
          disabled={parseInt(params.id) === 1}
          variant="outline"
          size="icon"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon />
        </Button>

        <span className="text-accent-foreground">
          Halaman <strong>{params.id}</strong> dari <strong>604</strong>
        </span>
        <Button
          onClick={nextPage}
          disabled={parseInt(params.id) === 604}
          size="icon"
          variant="outline"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon />
        </Button>
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
