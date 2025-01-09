import ky from "ky";
import { cn } from "#app/utils/misc.tsx";
import Fuse from "fuse.js";
import { Search as SearchIcon } from "lucide-react";
import { useLoaderData, Link } from "@remix-run/react";
import { json, type ClientLoaderFunctionArgs } from "@remix-run/node";
import { Scroll, Minus, Dot } from "lucide-react";
import { ClientOnly } from "remix-utils/client-only";
import Loader from "#app/components/ui/loader";
import { buttonVariants } from "#app/components/ui/button";
import { Spinner } from "#app/components/ui/spinner-circle";
import { Tab, TabList, TabPanel, Tabs } from "#app/components/ui/tabs";
import { data as daftar_surat } from "#app/constants/daftar-surat.json";
import * as React from "react";
import { ChevronDown, BookOpen, ArrowRight } from "lucide-react";
import {
  Select,
  SelectButton,
  SelectContent,
  SelectItem,
  SelectValue,
} from "#app/components/ui/select-aria";

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

export async function loader() {
  const api = ky.create({ prefixUrl: "https://api.myquran.com/v2/quran" });

  const juz = await api.get("juz/semua").json();

  // Validasi respons
  if (!juz.status) {
    throw new Response("Not Found", { status: 404 });
  }

  // Gabungkan data
  const data = {
    juz: juz.data,
    surat: daftar_surat,
  };

  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=31560000",
    },
  });
}

import {
  get_cache,
  set_cache,
  construct_key,
} from "#app/utils/cache-client.ts";

export async function clientLoader({
  request,
  serverLoader,
}: ClientLoaderFunctionArgs) {
  const key = construct_key(request);

  const cachedData = await get_cache(key);

  if (cachedData) {
    return cachedData; // (3)
  }

  const serverData = await serverLoader();
  await set_cache(key, serverData);
  return serverData;
}

export function App() {
  let [version, setVersion] = React.useState("v1");
  return (
    <div className="mt-2 max-w-md mx-auto py-1 w-full">
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
        Al-Qur'an
      </h1>

      <Tabs>
        <TabList
          aria-label="options surah or juz"
          className="grid grid-cols-2 w-fit mx-auto mt-2"
        >
          <Tab id="juz">Juz</Tab>
          <Tab id="surat">Surat</Tab>
        </TabList>
        <TabPanel id="surat" className="mt-1">
          <SurahView version={version} />
        </TabPanel>
        <TabPanel id="juz" className="mt-1">
          <JuzView version={version} />
        </TabPanel>
      </Tabs>

      <div className="flex items-center justify-between w-full my-2">
        <Link
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "group flex items-center",
          )}
          to="/muslim/quran-kemenag/"
        >
          <BookOpen className="opacity-60" strokeWidth={2} aria-hidden="true" />
          <span>Tafsir Kemenag</span>
          <ArrowRight
            className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2}
            aria-hidden="true"
          />
        </Link>

        <Select
          aria-label="Select Version"
          selectedKey={version}
          onSelectionChange={(selected) => setVersion(selected)}
          id="select-version"
          className="max-w-[100px]"
        >
          <SelectButton variant="outline">
            <SelectValue>
              {({ selectedText }) => {
                return <span>{selectedText || "Version"}</span>;
              }}
            </SelectValue>
            <ChevronDown size="16" strokeWidth="3" />
          </SelectButton>
          <SelectContent>
            <SelectItem id="v1" textValue="v1">
              v1
            </SelectItem>
            <SelectItem id="v2" textValue="v2">
              v2
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

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

function SurahView({ version }) {
  const { surat } = useLoaderData();
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
    <div className="max-w-md mx-auto border rounded-lg">
      <div className="relative">
        <input
          id="input-26"
          className="h-10 peer pe-9 ps-9 outline-none focus-visible:ring-0 focus-visible:ring-none border-b rounded-t-lg w-full px-3 py-5 bg-background"
          placeholder="Cari Surat..."
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
        data={surat}
        searchKey={["name_id", "number", "translation_id"]}
        query={query}
        render={(filteredData) => (
          <VirtualizedListSurah items={filteredData} version={version} />
        )}
      />
    </div>
  );
}

const VirtualizedListSurah: React.FC<{ items: any[] }> = ({
  items,
  version,
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Gunakan useVirtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 56, // Perkiraan tinggi item (70px)
  });

  return (
    <div
      ref={parentRef}
      className="p-2"
      style={{
        height: "300px",
        overflow: "auto",
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index].item;

          const to =
            version === "v2"
              ? `/muslim/quran/v2/${item.number}?intent=surat`
              : `/muslim/quran/${item.number}?intent=surat`;
          return (
            <div
              key={virtualRow.key}
              ref={virtualRow.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <Link
                to={to}
                className="relative flex cursor-default select-none items-start rounded-sm px-2 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground text-sm"
              >
                {item.number}.
                <div>
                  <span className="font-semibold">{item.name_id}</span>{" "}
                  <span className="opacity-80">({item.translation_id})</span>
                  <div className="flex items-center text-muted-foreground gap-1">
                    <span>{item.revelation_id}</span>
                    <div className="w-2 relative">
                      <Dot className="absolute -left-2 -top-3" />
                    </div>
                    <span>{item.number_of_verses} ayat</span>
                  </div>
                </div>
                <div className="sm:block hidden ml-auto font-lpmq-2 text-lg text-primary text-right">
                  {item.name_short}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const VirtualizedListJuz: React.FC<{ items: any[] }> = ({ items, version }) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Gunakan useVirtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 56, // Perkiraan tinggi item (70px)
  });

  return (
    <div
      ref={parentRef}
      className="p-2"
      style={{
        height: "300px",
        overflow: "auto",
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index].item;

          const itemNumber =
            virtualRow.index === 0 ? 1 : virtualRow.index * 20 + 2;
          const to =
            version === "v2"
              ? `/muslim/quran/v2/${itemNumber}`
              : `/muslim/quran/${itemNumber}`;

          return (
            <div
              key={virtualRow.key}
              ref={virtualRow.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <Link
                to={to}
                className="relative flex cursor-default select-none items-start gap-x-2 rounded-sm px-2 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground  text-sm"
              >
                <Scroll className="h-5 w-5 fill-muted mt-0.5" />
                <div>
                  <span className="font-semibold">{item.name}</span>
                  <div className="flex items-center text-sm text-muted-foreground gap-1">
                    <span>
                      {item.name_start_id} {item.verse_start}
                    </span>
                    <Minus />
                    <span className="sm:text-sm text-xs">
                      {item.name_end_id === item.name_start_id
                        ? ""
                        : item.name_end_id}{" "}
                      {item.verse_end}
                    </span>
                  </div>
                </div>
                <div className="ml-auto">Hal {itemNumber}</div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function JuzView({ version }) {
  const { juz } = useLoaderData();

  const [input, setInput] = useState(""); // Input langsung dari user
  const [query, setQuery] = useState(""); // Query untuk pencarian (didebounce)
  // Debounced setter untuk query
  const handleSearch = useMemo(
    () =>
      lodash.debounce((value: string) => {
        setQuery(value);

        document.getElementById("loading-indicator")?.classList.add("hidden");
      }, 300), // Debounce dengan delay 300ms
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value); // Update input langsung
    handleSearch(e.target.value); // Debounce pencarian
    document.getElementById("loading-indicator")?.classList.remove("hidden");
  };

  return (
    <div className="max-w-md mx-auto border rounded-lg">
      <div className="relative">
        <input
          id="input-26"
          className="h-10 peer pe-9 ps-9 outline-none focus-visible:ring-0 focus-visible:ring-none border-b rounded-t-lg w-full px-3 py-5 bg-background"
          placeholder="Cari Juz..."
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
        data={juz}
        searchKey={["name", "number", "name_start_id", "name_end_id"]}
        query={query}
        render={(filteredData) => (
          <VirtualizedListJuz items={filteredData} version={version} />
        )}
      />
    </div>
  );
}

export default function Route() {
  return <ClientOnly fallback={<Loader />}>{() => <App />}</ClientOnly>;
}
