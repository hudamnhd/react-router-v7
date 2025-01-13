import ky from "ky";
import cache from "#app/utils/cache-server.ts";
import { cn } from "#app/utils/misc.tsx";
import Fuse from "fuse.js";
import { Search as SearchIcon } from "lucide-react";
import {
  Outlet,
  useLoaderData,
  useRouteLoaderData,
  useParams,
  Link,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { Scroll, Minus, Dot } from "lucide-react";
import { ClientOnly } from "remix-utils/client-only";
import Loader from "#app/components/ui/loader";
import { Spinner } from "#app/components/ui/spinner-circle";
import { Tab, TabList, TabPanel, Tabs } from "#app/components/ui/tabs";
import { data as daftar_surat } from "#app/constants/daftar-surat.json";

import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Quran | Doti App" }];

export async function clientLoader() {
  return await ky.get("/resources/quran/surat").json();
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <Loader />;
}

function App() {
  const { id } = useParams();
  let [version] = React.useState("v1");
  const is_desktop = window.innerWidth > 1279;
  const quran = useLoaderData();

  return (
    <div className="flex items-start gap-x-3">
      <div className="block  max-w-sm mx-auto py-1 w-full sticky top-[60px]">
        <SurahView version={version} />
      </div>
      <Outlet />
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
  const surat = useLoaderData();
  const childLoaderData = useRouteLoaderData("routes/muslim+/quran+/$id");
  const child_data = [];

  const is_surat = [];
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
    <div className="max-w-sm mx-auto border rounded-lg">
      <div className="relative">
        <input
          id="input-26"
          className="h-10 peer pe-9 ps-9 outline-none focus-visible:ring-0 focus-visible:ring-none border-b rounded-t-lg w-full px-3 py-5 bg-background text-sm"
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
        searchKey={["asma.id.short", "number"]}
        query={query}
        render={(filteredData) => (
          <VirtualizedListSurah
            items={filteredData}
            version={version}
            id={is_surat}
          />
        )}
      />
    </div>
  );
}

const VirtualizedListSurah: React.FC<{ items: any[] }> = ({
  items,
  version,
  id,
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
      className="p-2 h-[calc(100vh-100px)]"
      style={{
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

          const to = `/muslim/quran/${item.number}`;
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
                className={cn(
                  "relative flex cursor-default select-none items-start rounded-sm px-2 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground  text-sm",
                  // id.includes(item.number) && "bg-accent",
                )}
              >
                {item.number}.
                <div>
                  <span className="font-semibold">{item.asma.id.short}</span>{" "}
                  <span className="opacity-80">
                    ({item.asma.translation.id})
                  </span>
                  <div className="flex items-center text-muted-foreground gap-1">
                    <span>{item.type.id}</span>
                    <div className="w-2 relative">
                      <Dot className="absolute -left-2 -top-3" />
                    </div>
                    <span>{item.ayahCount} ayat</span>
                  </div>
                </div>
                <div className="ml-auto font-lpmq-2 text-lg text-primary text-right">
                  {item.asma.ar.short}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const VirtualizedListJuz: React.FC<{ items: any[] }> = ({
  items,
  version,
  is_juz,
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Gunakan useVirtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 58, // Perkiraan tinggi item (70px)
  });

  return (
    <div
      ref={parentRef}
      className="p-2 h-[calc(100vh-165px)]"
      style={{
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
                className={cn(
                  "relative flex cursor-default select-none items-start gap-x-2 rounded-sm px-2 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground text-sm",
                  is_juz === item.number && "bg-accent",
                )}
              >
                <Scroll className="h-5 w-5 fill-muted mt-0.5" />
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

  const childLoaderData = useRouteLoaderData("routes/muslim+/quran+/$id");
  const child_data = childLoaderData
    ? Object.values(childLoaderData.group_surat)
    : [];
  const is_ayat = child_data.length > 0 ? child_data[0].ayat[0].juz : null;

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
    <div className="max-w-sm mx-auto border rounded-lg">
      <div className="relative">
        <input
          id="input-26"
          className="h-10 peer pe-9 ps-9 outline-none focus-visible:ring-0 focus-visible:ring-none border-b rounded-t-lg w-full px-3 py-5 bg-background text-sm"
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
          <VirtualizedListJuz
            items={filteredData}
            version={version}
            is_juz={is_ayat}
          />
        )}
      />
    </div>
  );
}

export default function Route() {
  return <ClientOnly fallback={<Loader />}>{() => <App />}</ClientOnly>;
}
