import ky from "ky";
import { useNavigate, useLoaderData } from "@remix-run/react";
import { json, type ClientLoaderFunctionArgs } from "@remix-run/node";
import { Star, BookOpen, Scroll, MoveRight, Minus, Dot } from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "#app/components/ui/tabs";
import { Input } from "#app/components/ui/input";
import { Badge } from "#app/components/ui/badge";
import { Label } from "#app/components/ui/label";
import { Button } from "#app/components/ui/button";

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

export async function loader() {
  const api = ky.create({ prefixUrl: "https://api.myquran.com/v2/quran" });
  const [surat, juz] = await Promise.all([
    api.get("surat/semua").json(),
    api.get("juz/semua").json(),
  ]);

  // Validasi respons
  if (!surat.status || !juz.status) {
    throw new Response("Not Found", { status: 404 });
  }

  // Gabungkan data
  const data = {
    juz: juz.data,
    surat: surat.data,
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
const selectedIds = [67, 36, 75, 18, 48, 55, 78]; // Daftar ID yang ingin ditampilkan

export default function Index() {
  const { juz, surat } = useLoaderData();
  const navigate = useNavigate();
  return (
    <div>
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
        Al-Qur'an
      </h1>

      <Tabs
        defaultValue="juz"
        className="flex flex-col items-center mt-2 sm:w-[50vh] mx-auto"
      >
        {/*<div className="max-w-xl ">
          <pre>{JSON.stringify(surat[0], null, 2)}</pre>
        </div>*/}
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="juz">Juz</TabsTrigger>
          <TabsTrigger value="surat">Surat</TabsTrigger>
        </TabsList>
        <TabsContent value="surat" className="w-full">
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Cari surat..." />
            <CommandList className="max-h-[calc(100vh-300px)] h-full">
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandSeparator />
              <CommandGroup heading="Surat Favorit">
                {surat
                  ?.filter((navItem) =>
                    selectedIds.includes(parseInt(navItem.number)),
                  )
                  .map((navItem) => (
                    <CommandItem
                      key={navItem.number}
                      value={navItem.number}
                      className="flex items-start gap-1.5"
                      onSelect={() => {
                        navigate(`/muslim/quran/${navItem.number}` as string);
                      }}
                    >
                      {navItem.number}.
                      <div>
                        <span className="font-semibold">{navItem.name_id}</span>{" "}
                        <span className="opacity-80">
                          ({navItem.translation_id})
                        </span>
                        <div className="flex items-center text-muted-foreground gap-1">
                          <span>{navItem.revelation_id}</span>
                          <div className="w-2 relative">
                            <Dot className="absolute -left-2 -top-3" />
                          </div>
                          <span>{navItem.number_of_verses} ayat</span>
                        </div>
                      </div>
                      <div className="ml-auto font-lpmq2 text-lg text-primary text-right">
                        {navItem.name_short}
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandGroup heading="Daftar Surat">
                {surat
                  ?.filter(
                    (navItem) =>
                      !selectedIds.includes(parseInt(navItem.number)),
                  )
                  .map((navItem) => (
                    <CommandItem
                      key={navItem.number}
                      value={navItem.number}
                      className="flex items-start gap-1.5"
                      onSelect={() => {
                        navigate(`/muslim/quran/${navItem.number}` as string);
                      }}
                    >
                      {navItem.number}.
                      <div>
                        <span className="font-semibold">{navItem.name_id}</span>{" "}
                        <span className="opacity-80">
                          ({navItem.translation_id})
                        </span>
                        <div className="flex items-center text-muted-foreground gap-1">
                          <span>{navItem.revelation_id}</span>
                          <div className="w-2 relative">
                            <Dot className="absolute -left-2 -top-3" />
                          </div>
                          <span>{navItem.number_of_verses} ayat</span>
                        </div>
                      </div>
                      <div className="ml-auto font-lpmq2 text-lg text-primary text-right">
                        {navItem.name_short}
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </TabsContent>
        <TabsContent value="juz" className="w-full h-full">
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Cari Juz..." />
            <CommandList className="max-h-[calc(100vh-300px)] h-full">
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandSeparator />
              <CommandGroup heading="Daftar Juz">
                {juz?.map((navItem, index) => {
                  const itemNumber = index === 0 ? 1 : index * 20 + 2;
                  return (
                    <CommandItem
                      key={navItem.number}
                      value={navItem.number}
                      className="flex items-start gap-1.5"
                      onSelect={() => {
                        navigate(`/muslim/quran/${itemNumber}` as string);
                      }}
                    >
                      <Scroll className="h-5 w-5 fill-muted mt-1" />
                      <div>
                        <span className="font-semibold">{navItem.name}</span>
                        <div className="flex items-center text-sm text-muted-foreground gap-1">
                          <span>
                            {navItem.name_start_id} {navItem.verse_start}
                          </span>
                          <Minus />
                          <span>
                            {navItem.name_end_id} {navItem.verse_end}
                          </span>
                        </div>
                      </div>
                      <CommandShortcut>Hal {itemNumber}</CommandShortcut>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </TabsContent>
      </Tabs>

      {/*<div className="max-w-[150px] mx-auto flex items-center flex-col gap-2">
        <Label>Ke halaman</Label>
        <Input placeholder="Halaman" />
        <Button size="icon" className="flex-none w-full">
          <MoveRight />
        </Button>
      </div>*/}
    </div>
  );
}
