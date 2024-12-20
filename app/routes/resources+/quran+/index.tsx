import { Link, useNavigate, useLoaderData } from "@remix-run/react";

import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type HeadersFunction,
  type LinksFunction,
  type MetaFunction,
} from "@remix-run/node";

import { Star, BookOpen } from "lucide-react";

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
} from "#app/components/ui/command";

export async function loader({ request }: LoaderFunctionArgs) {
  const res = await fetch(
    "https://raw.githubusercontent.com/ianoit/Al-Quran-JSON-Indonesia-Kemenag/refs/heads/master/Daftar%20Surat.json",
  );
  const result = await res.json();
  return json(result, {
    headers: {
      "Cache-Control": "public, max-age=31560000 ",
    },
  });
}

const selectedIds = [67, 36, 75, 18, 48, 55, 78]; // Daftar ID yang ingin ditampilkan

export default function Index() {
  const { data } = useLoaderData();
  const navigate = useNavigate();
  return (
    <div>
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
        Al-Qur'an
      </h1>
      <Command className="rounded-lg border shadow-md max-w-md mx-auto mt-2">
        <CommandInput placeholder="Cari surat..." />
        <CommandList className="max-h-[calc(100vh-200px)]">
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
                    navigate(`/muslim/quran/${navItem.id}` as string);
                  }}
                >
                  <Star className="h-5 w-5 fill-muted" />
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
                    navigate(`/muslim/quran/${navItem.id}` as string);
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
    </div>
  );
}
