import { Button, buttonVariants } from "#app/components/ui/button";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import { motion, useSpring, useScroll } from "framer-motion";
import { cn } from "#app/utils/misc.tsx";
import Fuse from "fuse.js";
import {
  Search as SearchIcon,
  ChevronLeft,
  ChevronDown,
  Check,
} from "lucide-react";
import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Scroll, Minus, Dot } from "lucide-react";
import { ClientOnly } from "remix-utils/client-only";
import Loader from "#app/components/ui/loader";
import { Spinner } from "#app/components/ui/spinner-circle";
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

  const data = {
    id,
    surat: daftar_surat,
    juz_amma: daftar_surat.filter((surat) => parseInt(surat.number) >= 78),
  };

  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=31560000",
    },
  });
}

export const shouldRevalidate = () => true;

function App() {
  return <SurahView />;
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

import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "#app/components/ui/select";

function SurahView() {
  const { id, surat, juz_amma } = useLoaderData();
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

  let [version, setVersion] = React.useState("all");
  const data_surat = version === "all" ? surat : juz_amma;
  const data_placeholder =
    version === "all" ? "Cari Surat.." : "Cari Surat Juz Amma..";

  return (
    <div className="max-w-xl mx-auto border-x">
      <div className="px-1.5 pt-2.5 pb-2 flex justify-between gap-x-3 border-b">
        <div className="flex items-center gap-x-2">
          <Link
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
              "prose-none [&_svg]:size-6",
            )}
            to="/muslim"
          >
            <ChevronLeft />
          </Link>
          <Select
            aria-label="Select Type List"
            className="text-lg font-semibold min-w-[140px]"
            placeholder="Daftar Surat"
            selectedKey={version}
            onSelectionChange={(selected) => setVersion(selected)}
          >
            <SelectTrigger className="data-[focus-visible]:ring-none data-[focus-visible]:ring-0 border-none shadow-none p-0 [&_svg]:opacity-80 [&_svg]:size-[14px] underline underline-offset-4">
              <SelectValue className="text-lg font-semibold" />
            </SelectTrigger>
            <SelectPopover>
              <SelectListBox>
                <SelectItem id="all" textValue="Daftar Surat">
                  Daftar Surat
                </SelectItem>
                <SelectItem id="j30" textValue="Jus Amma">
                  Jus Amma
                </SelectItem>
              </SelectListBox>
            </SelectPopover>
          </Select>
        </div>

        <div className="flex items-center gap-x-2">
          <DisplaySetting themeSwitchOnly={true} />
        </div>
      </div>
      <div className="relative">
        <input
          id="input-26"
          className="h-10 peer pe-9 ps-9 outline-none focus-visible:ring-0 focus-visible:ring-none border-b rounded-t-lg w-full px-3 py-6 bg-background"
          placeholder={data_placeholder}
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
        data={data_surat}
        searchKey={["name_id", "number", "translation_id"]}
        query={query}
        render={(filteredData) => {
          if (filteredData.length > 0) {
            return <VirtualizedListSurah items={filteredData} id={id} />;
          } else {
            return (
              <div className="py-6 text-center text-sm h-[calc(100vh-105px)] flex items-center justify-center">
                No results found.
              </div>
            );
          }
        }}
      />
    </div>
  );
}

const VirtualizedListSurah: React.FC<{ items: any[] }> = ({ items }) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Gunakan useVirtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length, // Jumlah total item
    getScrollElement: () => parentRef.current, // Elemen tempat scrolling
    estimateSize: () => 56, // Perkiraan tinggi item (70px)
  });

  const { scrollYProgress } = useScroll({
    container: parentRef,
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <React.Fragment>
      <motion.div
        className="z-[60] bg-gradient-to-r from-fuchsia-500 to-cyan-500 dark:from-fuchsia-400 dark:to-cyan-400 max-w-xl mx-auto"
        style={{
          scaleX,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          originX: 0,
        }}
      />
      <div
        ref={parentRef}
        className="h-[calc(100vh-105px)] pb-3"
        style={{
          overflow: "auto",
        }}
      >
        <div
          className="divide-y"
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
                    "relative flex cursor-pointer select-none items-start px-3 py-2.5 sm:py-1.5 outline-none hover:bg-accent hover:text-accent-foreground sm:text-base text-sm",
                  )}
                >
                  {item.number}.
                  <div>
                    <span className="font-semibold ml-1">{item.name_id}</span>{" "}
                    <span className="opacity-80">({item.translation_id})</span>
                    <div className="ml-1 flex items-center text-muted-foreground gap-1 sm:text-sm text-xs">
                      <span>{item.revelation_id}</span>
                      <div className="w-2 relative">
                        <Dot className="absolute -left-2 -top-3" />
                      </div>
                      <span>{item.number_of_verses} ayat</span>
                    </div>
                  </div>
                  <div className="sm:block hidden ml-auto font-lpmq-2 text-xl text-primary text-right my-auto">
                    {item.name_short}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};

export default function Route() {
  return <ClientOnly fallback={<Loader />}>{() => <App />}</ClientOnly>;
}

import { Label, Radio, RadioGroup } from "react-aria-components";

function Component() {
  return (
    <div className="bg-gradient-to-r from-blue-300 to-indigo-300 p-2 sm:p-8 rounded-lg flex justify-center">
      <RadioGroup
        className="flex flex-col gap-2 w-full max-w-[300px]"
        defaultValue="Standard"
      >
        <Label className="text-xl text-slate-900 font-semibold font-serif">
          Shipping
        </Label>
        <ShippingOption
          name="Standard"
          time="4-10 business days"
          price="$4.99"
        />
        <ShippingOption
          name="Express"
          time="2-5 business days"
          price="$15.99"
        />
        <ShippingOption name="Lightning" time="1 business day" price="$24.99" />
      </RadioGroup>
    </div>
  );
}

function ShippingOption({ name, time, price }) {
  return (
    <Radio
      value={name}
      className={({ isFocusVisible, isSelected, isPressed }) => `
      group relative flex cursor-default rounded-lg px-4 py-3 shadow-lg outline-none bg-clip-padding border border-solid
      ${
        isFocusVisible
          ? "ring-2 ring-blue-600 ring-offset-1 ring-offset-white/80"
          : ""
      }
      ${
        isSelected
          ? "bg-blue-600 border-white/30 text-white"
          : "border-transparent"
      }
      ${isPressed && !isSelected ? "bg-blue-50" : ""}
      ${!isSelected && !isPressed ? "bg-white" : ""}
    `}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center shrink-0 text-blue-100 group-selected:text-white">
          <Check />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="text-lg font-serif font-semibold text-gray-900 group-selected:text-white">
            {name}
          </div>
          <div className="inline text-gray-500 group-selected:text-sky-100">
            {time}
          </div>
        </div>
        <div className="font-medium font-mono text-gray-900 group-selected:text-white">
          {price}
        </div>
      </div>
    </Radio>
  );
}
