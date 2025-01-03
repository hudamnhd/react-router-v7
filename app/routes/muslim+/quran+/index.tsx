import ky from "ky";
import Fuse from "fuse.js";
import { Search as SearchIcon } from "lucide-react";
import { useLoaderData, Link } from "@remix-run/react";
import { json, type ClientLoaderFunctionArgs } from "@remix-run/node";
import { Star, BookOpen, Scroll, MoveRight, Minus, Dot } from "lucide-react";
import { Input } from "#app/components/ui/input";
import { Label } from "react-aria-components";

import { ClientOnly } from "remix-utils/client-only";
import Loader from "#app/components/ui/loader";
import { Spinner } from "#app/components/ui/spinner-circle";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "#app/components/ui/tabs";
import { data as daftar_surat } from "#app/constants/daftar-surat.json";
import * as React from "react";

import { ChevronDown } from "lucide-react";
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

import { getCache, setCache, constructKey } from "#app/utils/cache-client.ts";

export async function clientLoader({
  request,
  serverLoader,
}: ClientLoaderFunctionArgs) {
  const key = constructKey(request);

  const cachedData = await getCache(key);

  if (cachedData) {
    return cachedData; // (3)
  }

  const serverData = await serverLoader();
  await setCache(key, serverData);
  return serverData;
}

function App() {
  let [version, setVersion] = React.useState("v1");
  console.warn("DEBUGPRINT[8]: index.tsx:80: version=", version);
  return (
    <div className="mt-2 max-w-md mx-auto py-1">
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
        Al-Qur'an
      </h1>

      <Tabs
        defaultValue="juz"
        className="flex flex-col items-center mt-2 mx-auto"
      >
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="juz">Juz</TabsTrigger>
          <TabsTrigger value="surat">Surat</TabsTrigger>
        </TabsList>
        <TabsContent value="surat" className="w-full tab-content" forceMount>
          <SurahView version={version} />
        </TabsContent>
        <TabsContent
          value="juz"
          className="w-full h-full tab-content"
          forceMount
        >
          <JuzView version={version} />
        </TabsContent>
      </Tabs>

      <div>
        <Select
          aria-label="Select Version"
          selectedKey={version}
          onSelectionChange={(selected) => setVersion(selected)}
          id="select-version"
          className="my-2 max-w-[100px] mx-auto"
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
      className="py-2"
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
                className="relative flex cursor-default select-none items-start rounded-sm px-2 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground  text-sm"
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
                <div className="ml-auto font-lpmq-2 text-lg text-primary text-right">
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
      className="py-2"
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
                className="relative flex cursor-default select-none items-start rounded-sm px-2 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground  text-sm"
              >
                <Scroll className="h-5 w-5 fill-muted mt-1" />
                <div>
                  <span className="font-semibold">{item.name}</span>
                  <div className="flex items-center text-sm text-muted-foreground gap-1">
                    <span>
                      {item.name_start_id} {item.verse_start}
                    </span>
                    <Minus />
                    <span>
                      {item.name_end_id} {item.verse_end}
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
