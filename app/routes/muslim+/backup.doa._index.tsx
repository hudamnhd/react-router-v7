import { data } from "#/app/constants/doaharian";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import { Button, buttonVariants } from "#app/components/ui/button";
import Fuse from "fuse.js";
import { ClientOnly } from "remix-utils/client-only";
import Loader from "#app/components/ui/loader";
import { Spinner } from "#app/components/ui/spinner-circle";
import { useLoaderData, Link } from "@remix-run/react";
import ky from "ky";
import { json } from "@remix-run/node";
import {
  BookOpen,
  ChevronLeft,
  Search as SearchIcon,
  Scroll,
  CheckCircle,
  Activity,
  X,
  Circle,
  Heart,
  MapPin,
  Search,
} from "lucide-react";
import {
  Dialog,
  Heading,
  DialogTrigger,
  Modal,
  ModalOverlay,
  ModalContext,
} from "react-aria-components";
import { cn } from "#app/utils/misc.tsx";
import cache from "#app/utils/cache-server.ts";

import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Doa | Doti App" }];

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

export async function loader() {
  const cacheKey = `doa-lengkap`;
  const cacheData = cache.get(cacheKey);

  if (cacheData) {
    return cacheData;
  }
  const api = ky.create({ prefixUrl: "https://api.myquran.com/v2/doa/sumber" });
  const sumber = [
    "quran",
    "hadits",
    "pilihan",
    "harian",
    "ibadah",
    "haji",
    "lainnya",
  ];
  const data = await Promise.all(sumber.map((item) => api.get(item).json()));

  cache.set(cacheKey, data);
  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=31560000",
    },
  });
}

const sumberIcons = {
  quran: BookOpen,
  hadits: Scroll,
  pilihan: CheckCircle,
  harian: Activity,
  ibadah: Heart,
  haji: MapPin,
  lainnya: Circle,
};

const BOOKMARK_KEY = "BOOKMARK";

function Doa() {
  const loaderData = useLoaderData();

  const filteredData = React.useMemo(
    () => loaderData?.filter((item) => item.status === true),
    [loaderData],
  );

  // Map data ke format baru
  const result = React.useMemo(
    () =>
      filteredData?.map((item) => ({
        label: item.request.path.replace(/\//g, " ").replace(/sumber/gi, ""), // Ganti '/' dengan spasi
        source: item.request.path.replace(/\//g, " ").trim().split(" ").pop(),
        data: item.data,
      })),
    [filteredData],
  );

  return (
    <React.Fragment>
      <div className="prose-base dark:prose-invert w-full max-w-xl mx-auto border-x">
        <div className="px-1.5 pt-2.5 pb-2 flex justify-between gap-x-3 sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <div className="flex items-center gap-x-2">
            <Link
              className={cn(
                buttonVariants({ size: "icon", variant: "outline" }),
                "prose-none [&_svg]:size-6 bg-transparent",
              )}
              to="/muslim"
            >
              <ChevronLeft />
            </Link>
            <span className="text-lg font-semibold capitalize">Do'a</span>
          </div>

          <DisplaySetting />
        </div>
        <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-2">
          Do'a
        </div>

        <TabDemo result={result} />
      </div>
    </React.Fragment>
  );
}

const DialogResponsive = ({ content }) => {
  return (
    <React.Fragment>
      <DialogTrigger type="modal">
        <ModalOverlay
          isDismissable
          className={({ isEntering, isExiting }) =>
            cn(
              "fixed inset-0 z-50 bg-black/80",
              isEntering ? "animate-in fade-in duration-300 ease-out" : "",
              isExiting ? "animate-out fade-out duration-300 ease-in" : "",
            )
          }
        >
          <Modal
            className={({ isEntering, isExiting }) =>
              cn(
                "fixed sm:left-[50%] sm:top-[50%] z-50 w-full sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] border-b sm:border-none bg-background sm:rounded-md inset-x-0 bottom-0 shadow-xl bg-background p-2 sm:p-0 h-fit w-full sm:max-w-4xl",
                isEntering
                  ? "animate-in slide-in-from-bottom duration-300"
                  : "",
                isExiting ? "animate-out slide-out-to-bottom duration-300" : "",
              )
            }
          >
            <Dialog
              role="alertdialog"
              className="outline-none relative pb-2 sm:pb-5"
            >
              {({ close }) => (
                <div className="grid gap-2.5 px-2">
                  <div className="w-fit mx-auto mt-4 ">
                    <Button
                      onPress={close}
                      size="sm"
                      className="h-2 w-[100px] rounded-full bg-muted  sm:hidden block"
                    />
                  </div>
                  <Heading>
                    <div className="grid gap-1.5 px-4 text-center sm:text-left">
                      <p className="text-lg">{content.judul}</p>
                      <p className="text-muted-foreground -mt-2">
                        sumber doa: {content.source}
                      </p>
                    </div>
                  </Heading>

                  <div className="px-4 max-h-[65vh] overflow-y-auto">
                    <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
                      <p
                        className="relative mt-2 text-right font-lpmq"
                        dangerouslySetInnerHTML={{
                          __html: content.arab,
                        }}
                      />
                    </div>
                    <div className="mt-3 space-y-3">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: content.indo,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex sm:hidden items-center justify-center w-full outline-none">
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
  );
};

import { Badge } from "#app/components/ui/badge";

import { Tab, TabList, TabPanel, Tabs } from "#app/components/ui/tabs";

function TabDemo({ result }) {
  const combinedData = result.flatMap((obj) => obj.data);
  const doaharian = React.useMemo(
    () =>
      data.map((d) => ({
        arab: d.arabic,
        indo: d.translation,
        judul: d.title,
        source: "harian",
      })),
    [data],
  );

  return (
    <React.Fragment>
      <Tabs defaultSelectedKey="source_quran">
        <div className="overflow-x-auto">
          <TabList
            aria-label="Kumpulan Doa berbagai sumber"
            className="mb-2 h-auto gap-2 rounded-none border-b border-border bg-transparent py-1 px-1 text-foreground"
          >
            <Tab
              id="search_source"
              className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[selected]:bg-transparent data-[selected]:shadow-none data-[selected]:after:bg-primary data-[selected]:hover:bg-accent shadow-none flex items-center"
            >
              <Search
                size={16}
                strokeWidth={2}
                className="-ms-0.5 me-1.5 opacity-60"
              />
              <span className="font-semibold capitalize text-sm">Cari</span>
            </Tab>
            {result.map((d, actionIdx) => {
              const Icon = sumberIcons[d.source] || Circle; // Default ke Dot jika tidak match
              return (
                <Tab
                  id={`search_${d.source}`}
                  key={actionIdx}
                  className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[selected]:bg-transparent data-[selected]:shadow-none data-[selected]:after:bg-primary data-[selected]:hover:bg-accent shadow-none flex items-center"
                >
                  <Icon
                    size={16}
                    strokeWidth={2}
                    className="-ms-0.5 me-1.5 opacity-60"
                  />
                  <span className="font-semibold capitalize text-sm">
                    {d.label}
                  </span>
                  <Badge
                    className="ms-1.5 min-w-5 bg-primary/15 px-1"
                    variant="secondary"
                  >
                    {d.data?.length}
                  </Badge>
                </Tab>
              );
            })}
          </TabList>
        </div>
        <TabPanel id="search_source" className="mt-0">
          <SearchView result={combinedData} />
        </TabPanel>
        {result?.map((d) => (
          <TabPanel
            id={`search_${d.source}`}
            key={d.label}
            value={d.source}
            className="p-0 m-0"
          >
            <DoaView source={d.source} items={d.data} />
          </TabPanel>
        ))}
      </Tabs>
    </React.Fragment>
  );
}

import { get_cache, set_cache } from "#app/utils/cache-client.ts";
import { save_bookmarks, type Bookmark } from "#app/utils/bookmarks";

import React from "react";

const TAGS = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`,
);

const DoaView = ({ items }) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);

  React.useEffect(() => {
    const load_bookmark_from_lf = async () => {
      const storedBookmarks = await get_cache(BOOKMARK_KEY);
      if (storedBookmarks) {
        setBookmarks(storedBookmarks);
      }
    };

    load_bookmark_from_lf();
  }, []);

  const bookmarks_ayah = bookmarks
    .filter((item) => item.type === "doa")
    .map((item) => {
      const params = new URLSearchParams(item.source.split("?")[1]);
      return {
        created_at: item.created_at,
        id: params.get("index"),
        source: item.source,
      }; // Ambil nilai "ayat"
    });

  const toggleBookmark = (doa) => {
    const newBookmarks = save_bookmarks(
      "doa",
      {
        title: doa.judul,
        arab: doa.arab,
        latin: null,
        translation: doa.indo,
        source: `/muslim/doa?index=${doa.index}&source=${doa.source}`,
      },
      [...bookmarks],
    );

    const is_saved = bookmarks_ayah.find((fav) => fav.id === doa.index);

    if (is_saved) {
      const newBookmarks = bookmarks?.filter(
        (d) => d.created_at !== is_saved.created_at,
      );
      setBookmarks(newBookmarks);
    } else {
      setBookmarks(newBookmarks);
    }
  };

  React.useEffect(() => {
    const save_bookmark_to_lf = async (bookmarks) => {
      await set_cache(BOOKMARK_KEY, bookmarks);
    };
    save_bookmark_to_lf(bookmarks);
  }, [bookmarks]);

  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 35,
  });

  return (
    <div
      ref={parentRef}
      className="px-2.5 h-[calc(100vh-175px)] overflow-y-auto"
    >
      <div>
        <div
          className="space-y-0.5 py-2"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const d = items[virtualRow.index];
            const doa = {
              ...d,
              index: virtualRow.index.toString(),
            };

            const _source = `/muslim/doa?index=${doa.index}&source=${doa.source}`;

            const isFavorite = bookmarks_ayah.some(
              (fav) => fav.source === _source,
            );
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
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div key={virtualRow.index} className="w-full border-b">
                  <div className="group relative py-4 px-2 rounded-md w-full">
                    <div className="flex items-center sm:items-start sm:justify-between gap-x-2 mb-2">
                      <div className="font-medium text-lg sm:order-first order-last">
                        {doa.judul}
                      </div>

                      <button
                        onClick={() => toggleBookmark(doa)}
                        className={cn(
                          "order-0 sm:order-1 bg-gradient-to-br from-muted to-accent p-3 rounded-xl",
                          isFavorite &&
                            "from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20",
                        )}
                      >
                        <Heart
                          className={cn(
                            "w-5 h-5 text-muted-foreground",
                            isFavorite && "text-rose-600 dark:text-rose-400",
                          )}
                        />
                      </button>
                    </div>
                    <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
                      <p
                        className="relative mt-2 font-lpmq text-right text-primary"
                        dangerouslySetInnerHTML={{
                          __html: doa.arab,
                        }}
                      />
                    </div>
                    <div className="mt-3 space-y-3">
                      <div
                        className="translation-text prose-sm text-muted-foreground max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: doa.indo,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { JSX, useMemo, useState } from "react";
import lodash from "lodash";

interface SearchProps<T> {
  data: T[];
  searchKey: keyof T;
  query: string;
  render: (filteredData: T[]) => JSX.Element;
}

function SearchHandler<T>({ data, searchKey, query, render }: SearchProps<T>) {
  const options = {
    includeScore: false,
    keys: searchKey,
  };
  const fuse = new Fuse(data, options);
  const filteredData = useMemo(() => {
    if (!query)
      return data.map((d) => {
        return { item: { ...d } };
      });
    return fuse.search(query);
  }, [data, searchKey, query]);

  return render(filteredData);
}

import { useVirtualizer } from "@tanstack/react-virtual";

function SearchView({ result }) {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  const handleSearch = useMemo(
    () =>
      lodash.debounce((value: string) => {
        setQuery(value);
        document.getElementById("loading-indicator")?.classList.add("hidden");
      }, 300),
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    handleSearch(e.target.value);
    document.getElementById("loading-indicator")?.classList.remove("hidden");
  };

  return (
    <div className="border-t">
      <div className="relative">
        <input
          id="input-26"
          className="h-10 peer pe-9 ps-9 outline-none focus-visible:ring-0 focus-visible:ring-none border-b rounded-t-lg w-full px-3 py-5 bg-background text-sm"
          placeholder="Cari doa berbagai sumber..."
          type="search"
          value={input}
          onChange={handleInputChange}
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <SearchIcon size={16} strokeWidth={2} />
        </div>
        <div
          id="loading-indicator"
          className="hidden absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 transition-colors"
        >
          <Spinner className="size-5" />
        </div>
      </div>

      <SearchHandler
        data={result}
        searchKey={["judul"]}
        query={query}
        render={(filteredData) => <VirtualizedListSurah items={filteredData} />}
      />
    </div>
  );
}

const VirtualizedListSurah: React.FC<{ items: any[] }> = ({ items }) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 35,
  });

  let [isOpen, setOpen] = React.useState(false);
  const renderCount = React.useRef(0);
  const contentRef = React.useRef(null);
  const isDesktop = React.useRef(false);
  renderCount.current++;
  const content = contentRef.current;

  const runCommand = React.useCallback(() => {
    setOpen(false);
  }, []);
  return (
    <React.Fragment>
      <ModalContext.Provider value={{ isOpen, onOpenChange: runCommand }}>
        <DialogResponsive isDesktop={isDesktop.current} content={content} />
      </ModalContext.Provider>
      <div
        ref={parentRef}
        style={{
          height: "300px",
          overflow: "auto",
        }}
      >
        <div
          className="space-y-0.5 py-2"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = items[virtualRow.index].item;

            const Icon = sumberIcons[item.source] || Circle; // Default ke Dot jika tidak match
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
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => {
                  isDesktop.current = window.innerWidth > 767;
                  contentRef.current = item;
                  setOpen(true);
                }}
              >
                <div className="relative flex cursor-default select-none items-center gap-x-2.5 rounded-sm px-2 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground">
                  <Icon className="h-[20px] w-[20px] flex-none sm:flex hidden" />
                  <span className="flex-none sm:hidden flex">·</span>
                  <div className="mr-auto line-clamp-3">{item.judul}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};

export default function Route() {
  return <ClientOnly fallback={<Loader />}>{() => <Doa />}</ClientOnly>;
}
