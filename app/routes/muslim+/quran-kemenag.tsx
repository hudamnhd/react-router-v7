import ky from "ky";
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

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

export async function loader({ params }) {
  const { id } = params;

  // Gabungkan data
  const data = {
    id,
    surat: daftar_surat,
  };

  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=31560000",
    },
  });
}
export const shouldRevalidate = () => true;
function App() {
  const is_desktop = window.innerWidth > 1279;
  const { id } = useLoaderData();

  return (
    <div className="flex items-start relative">
      {is_desktop && (
        <div className="xl:block hidden max-w-sm mx-auto w-full sticky top-[57px]">
          <SurahView />
        </div>
      )}
      {!is_desktop && !id && (
        <div className="max-w-sm mx-auto w-full sticky top-[57px]">
          <SurahView />
        </div>
      )}
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

function SurahView() {
  const { id, surat } = useLoaderData();
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
    <div className="max-w-sm mx-auto border-l border-r xl:border-l xl:border-r-0">
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
        searchKey={["name_id", "number", "translation_id"]}
        query={query}
        render={(filteredData) => (
          <VirtualizedListSurah items={filteredData} id={id} />
        )}
      />
    </div>
  );
}

const VirtualizedListSurah: React.FC<{ items: any[] }> = ({ items, id }) => {
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

          const to = `/muslim/quran-kemenag/${item.number}`;
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
                  "relative flex cursor-default select-none items-start rounded-sm px-2 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground border-b text-sm",
                  id === item.number && "bg-accent",
                )}
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

export default function Route() {
  return <ClientOnly fallback={<Loader />}>{() => <App />}</ClientOnly>;
}
