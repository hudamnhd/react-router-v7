import { data } from "#/app/constants/doaharian";
import { useLoaderData } from "@remix-run/react";
import ky from "ky";
import React from "react";
import { json, type ClientLoaderFunctionArgs } from "@remix-run/node";
import {
  BookOpen,
  Scroll,
  CheckCircle,
  Circle,
  Heart,
  MapPin,
  Dot,
  Activity,
} from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "#app/components/ui/drawer";
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
import { Button } from "#app/components/ui/button";

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}
export async function loader() {
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

  // Validasi respons
  // Gabungkan data
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

const sumberIcons = {
  quran: BookOpen,
  hadits: Scroll,
  pilihan: CheckCircle,
  harian: Circle,
  ibadah: Heart,
  haji: MapPin,
  lainnya: Circle,
};
export default function Route() {
  const loaderData = useLoaderData();
  const filteredData = loaderData?.filter((item) => item.status === true);

  // Map data untuk menghasilkan format baru
  const result = filteredData.map((item) => {
    const label = item.request.path.replace(/\//g, " "); // Ganti '/' dengan spasi
    return {
      label,
      data: item.data,
    };
  });

  const doaharian = data.map((d) => {
    let obj = {
      arab: d.arabic,
      indo: d.translation,
      judul: d.title,
      source: "harian",
    };
    return obj;
  });

  const [open, setOpen] = React.useState(false);
  const [content, setContent] = React.useState(null);
  return (
    <React.Fragment>
      {content && (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{content.judul}</DrawerTitle>
              <DrawerDescription>sumber: {content.source}</DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
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
                  className="prose-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: content.indo,
                  }}
                />
              </div>
            </div>

            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
      <div>
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize mb-4">
          Do'a
        </h1>
        <Command className="rounded-lg border shadow-md max-w-4xl mx-auto">
          <CommandInput placeholder="Cari doa..." />
          <CommandList className="max-h-[calc(100vh-300px)] h-full">
            <CommandEmpty>No results found.</CommandEmpty>
            {result?.map((d) => (
              <React.Fragment key={d.label}>
                <CommandSeparator />
                <CommandGroup heading={d.label}>
                  {d.data.map((doa, index) => {
                    const Icon = sumberIcons[doa.source] || Circle; // Default ke Dot jika tidak match
                    const value = index + doa.source;
                    return (
                      <CommandItem
                        key={index}
                        value={value}
                        className="flex items-center gap-1.5"
                        onSelect={() => {
                          setContent(doa);
                          setOpen(true);
                          // navigate(`/muslim/quran/${navItem.number}` as string);
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{doa.judul}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </React.Fragment>
            ))}

            <React.Fragment>
              <CommandSeparator />
              <CommandGroup heading="doa sehari-hari">
                {doaharian.map((doa, index) => {
                  const Icon = Circle;
                  const value = index + doa.source;
                  return (
                    <CommandItem
                      key={index}
                      value={value}
                      className="flex items-center gap-1.5"
                      onSelect={() => {
                        setContent(doa);
                        setOpen(true);
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{doa.judul}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </React.Fragment>
          </CommandList>
        </Command>
      </div>
    </React.Fragment>
  );
}
