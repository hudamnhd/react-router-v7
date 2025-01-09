import React from "react";
import { Icon } from "#app/components/ui/icon.tsx";
import { Search as SearchIcon } from "lucide-react";
import Fuse from "fuse.js";
import lodash from "lodash";

interface SearchProps<T> {
  data: T[];
  searchKey: keyof T;
  query: string;
  render: (filteredData: T[]) => React.JSX.Element;
}

function SearchHandler<T>({ data, searchKey, query, render }: SearchProps<T>) {
  const options = {
    includeScore: false,
    keys: searchKey,
  };
  const fuse = new Fuse(data, options);
  const filteredData = React.useMemo(() => {
    if (!query)
      return data.map((d) => {
        return { item: { ...d } };
      });
    return fuse.search(query);
  }, [data, searchKey, query]);

  return render(filteredData);
}
import { useVirtualizer } from "@tanstack/react-virtual";

export function Command({ data, search_key, onSelect }) {
  const [input, setInput] = React.useState("");
  const [query, setQuery] = React.useState("");
  const loadingIndicatorRef = React.useRef(null);

  const handleSearch = React.useMemo(
    () =>
      lodash.debounce((value: string) => {
        setQuery(value);
        if (loadingIndicatorRef?.current) {
          loadingIndicatorRef?.current.classList.add("hidden");
        }
      }, 300),
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    handleSearch(e.target.value);

    if (loadingIndicatorRef?.current) {
      loadingIndicatorRef?.current.classList.remove("hidden");
    }
  };

  return (
    <div className="w-full border rounded-lg">
      <div className="relative">
        <input
          id="input-26"
          className="h-10 peer pe-12 ps-12 outline-none focus-visible:ring-0 focus-visible:ring-none border-b rounded-t-lg w-full px-3 py-6 bg-background text-sm"
          placeholder="Cari Surat..."
          type="search"
          value={input}
          autoFocus
          onChange={handleInputChange}
        />
        <div className="pointer-events-none absolute inset-y-0 start-1 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <SearchIcon size={20} strokeWidth={2} />
        </div>
        <div
          id="loading-indicator"
          ref={loadingIndicatorRef}
          className="hidden absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 transition-colors"
        >
          <Icon
            name="update"
            size="sm"
            className="m-1 animate-spin text-foreground"
            aria-hidden
          />
        </div>
      </div>

      <SearchHandler
        data={data}
        searchKey={search_key}
        query={query}
        render={(filteredData) => {
          if (filteredData.length > 0) {
            return (
              <VirtualizedListSurah items={filteredData} onSelect={onSelect} />
            );
          } else {
            return (
              <div className="py-6 text-center text-sm">No results found.</div>
            );
          }
        }}
      />
    </div>
  );
}

const VirtualizedListSurah: React.FC<{ items: any[] }> = ({
  items,
  onSelect,
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
  });

  return (
    <div
      ref={parentRef}
      className="px-2 py-1.5"
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
          const index = virtualRow.index;

          return (
            <div
              data-index={virtualRow.index}
              key={virtualRow.key}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                key={index}
                value={index}
                className="flex items-center gap-2.5 px-2.5 py-2  hover:bg-accent hover:text-accent-foreground text-sm rounded-md"
                onClick={() => {
                  onSelect(item);
                }}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
