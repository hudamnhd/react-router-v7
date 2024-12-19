import { Link, data as wrapper } from "react-router";
import type { Route } from "./+types/index";
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

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandShortcut,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";

export const loader = async () => {
  const res = await fetch(
    "https://raw.githubusercontent.com/ianoit/Al-Quran-JSON-Indonesia-Kemenag/refs/heads/master/Daftar%20Surat.json",
  );
  const result = await res.json();
  return wrapper(result, {
    headers: {
      "Cache-Control": "public, max-age=31560000, immutable",
    },
  });
};

const selectedIds = [67, 36, 75, 18, 48, 55, 78]; // Daftar ID yang ingin ditampilkan

export default function Index({ loaderData }: Route.ComponentProps) {
  const { data } = loaderData;
  return (
    <>
      <Command className="rounded-lg border shadow-md max-w-sm mx-auto">
        <CommandInput placeholder="Cari surat..." />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandSeparator />
          <CommandGroup heading="Surat Favorit">
            {data
              .filter((navItem) => selectedIds.includes(navItem.id))
              .map((navItem) => (
                <CommandItem
                  key={navItem.id}
                  value={navItem.id}
                  className="flex items-center gap-1.5"
                  onSelect={() => {
                    // navigate(`/muslim/quran-surat/${navItem.id}` as string);
                  }}
                >
                  <Star className="h-5 w-5" />
                  <span>{navItem.id}. </span>
                  <span>{navItem.surat_name}</span>
                  <CommandShortcut>{navItem.count_ayat} ayat</CommandShortcut>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandGroup heading="Daftar Surat">
            {data
              .filter((navItem) => !selectedIds.includes(navItem.id))
              .map((navItem) => (
                <CommandItem
                  key={navItem.id}
                  value={navItem.id}
                  className="flex items-center gap-1.5"
                  onSelect={() => {
                    // navigate(`/muslim/quran-surat/${navItem.id}` as string);
                  }}
                >
                  <BookOpen className="h-5 w-5" />
                  <span>{navItem.id}. </span>
                  <span>{navItem.surat_name}</span>
                  <CommandShortcut>{navItem.count_ayat} ayat</CommandShortcut>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </>
  );
}
