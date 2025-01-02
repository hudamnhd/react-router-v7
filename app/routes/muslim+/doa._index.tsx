import { data } from "#/app/constants/doaharian";
import { useLoaderData } from "@remix-run/react";
import ky from "ky";
import React from "react";
import { json, type ClientLoaderFunctionArgs } from "@remix-run/node";
import {
  BookOpen,
  Scroll,
  CheckCircle,
  Activity,
  Circle,
  Heart,
  MapPin,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#app/components/ui/dialog";

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

clientLoader.hydrate = true;

const sumberIcons = {
  quran: BookOpen,
  hadits: Scroll,
  pilihan: CheckCircle,
  harian: Activity,
  ibadah: Heart,
  haji: MapPin,
  lainnya: Circle,
};

export default function Route() {
  const loaderData = useLoaderData();

  // Filter data hanya yang memiliki status `true`
  const filteredData = React.useMemo(
    () => loaderData?.filter((item) => item.status === true),
    [loaderData],
  );

  // Map data ke format baru
  const result = React.useMemo(
    () =>
      filteredData?.map((item) => ({
        label: item.request.path.replace(/\//g, " ").replace(/sumber/gi, ""), // Ganti '/' dengan spasi
        source: item.request.path.replace(/\//g, " ").trim().split(" ").pop(),
        data: item.data,
      })),
    [filteredData],
  );

  // Format data doa harian
  const doaharian = React.useMemo(
    () =>
      data.map((d) => ({
        arab: d.arabic,
        indo: d.translation,
        judul: d.title,
        source: "harian",
      })),
    [data],
  );
  return (
    <React.Fragment>
      <div>
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize my-2">
          Do'a
        </h1>

        <TabDemo result={result} />
        {/*<Command className="rounded-lg border shadow-md max-w-3xl mx-auto">
          <CommandInput className="text-md" placeholder="Cari doa..." />
          <CommandList className="max-h-[calc(100vh-200px)] h-full">
            <CommandEmpty>No results found.</CommandEmpty>
            {result?.map((d) => (
              <React.Fragment key={d.label}>
                <CommandSeparator />
                <CommandGroup className="capitalize" heading={d.label}>
                  {d.data.map((doa, index) => {
                    return <ListItem key={index} index={index} doa={doa} />;
                  })}
                </CommandGroup>
              </React.Fragment>
            ))}

            <React.Fragment>
              <CommandSeparator />
              <CommandGroup heading="doa sehari-hari">
                {doaharian.map((doa, index) => {
                  return <ListItem key={index} index={index} doa={doa} />;
                })}
              </CommandGroup>
            </React.Fragment>
          </CommandList>
        </Command>*/}
      </div>
    </React.Fragment>
  );
}

const ListItem = ({ doa, index }) => {
  const Icon = sumberIcons[doa.source] || Circle; // Default ke Dot jika tidak match
  const value = index + doa.source;
  const [content, setContent] = React.useState(null);
  const renderCount = React.useRef(0);
  const isDesktop = React.useRef(false);
  renderCount.current++;

  const runCommand = React.useCallback(() => {
    setContent(null);
  }, []);

  return (
    <React.Fragment>
      {content && (
        <DialogResponsive
          isDesktop={isDesktop.current}
          content={content}
          runCommand={runCommand}
        />
      )}
      <CommandItem
        value={value}
        className="flex items-start gap-1.5 text-md"
        onSelect={() => {
          isDesktop.current = window.innerWidth > 767;
          setContent(doa);
        }}
      >
        <Icon className="h-5 w-5 flex-none sm:flex hidden" />
        <span className="flex-none sm:hidden flex">·</span>
        <span className="mr-auto">{doa.judul}</span>
      </CommandItem>
    </React.Fragment>
  );
};

export const DialogResponsive = ({ isDesktop, content, runCommand }) => {
  return (
    <React.Fragment>
      {isDesktop ? (
        <Dialog
          open={true}
          onOpenChange={(e) => {
            if (!e) runCommand();
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{content.judul}</DialogTitle>
              <DialogDescription>sumber: {content.source}</DialogDescription>
            </DialogHeader>
            <div className="px-4 max-h-[70vh] overflow-y-auto">
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
                  dangerouslySetInnerHTML={{
                    __html: content.indo,
                  }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer
          open={true}
          onOpenChange={(e) => {
            if (!e) runCommand();
          }}
        >
          <DrawerContent>
            <DrawerHeader className="p-0 px-4 py-2">
              <DrawerTitle>{content.judul}</DrawerTitle>
              <DrawerDescription>sumber: {content.source}</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 max-h-[70vh] overflow-y-auto">
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
    </React.Fragment>
  );
};

// Dependencies: pnpm install lucide-react

import { Badge } from "#app/components/ui/badge";
import { ScrollArea, ScrollBar } from "#app/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "#app/components/ui/tabs";
import {
  Box,
  ChartLine,
  House,
  PanelsTopLeft,
  Settings,
  UsersRound,
} from "lucide-react";

function TabDemo({ result }) {
  return (
    <Tabs defaultValue="quran">
      <ScrollArea className="max-w-4xl mx-auto">
        <TabsList className=" mb-3 h-auto gap-2 rounded-none border-b border-border bg-transparent px-0 py-1 text-foreground">
          {result.map((d, actionIdx) => {
            const Icon = sumberIcons[d.source] || Circle; // Default ke Dot jika tidak match
            return (
              <TabsTrigger
                value={d.source}
                key={actionIdx}
                className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
              >
                <Icon
                  size={16}
                  strokeWidth={2}
                  className="-ms-0.5 me-1.5 opacity-60"
                />
                <span className="font-semibold capitalize text-sm">
                  {d.label}
                </span>
                <Badge
                  className="ms-1.5 min-w-5 bg-primary/15 px-1"
                  variant="secondary"
                >
                  {d.data?.length}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {result?.map((d) => (
        <React.Fragment key={d.label}>
          <TabsContent value={d.source}>
            <Command className="rounded-lg border shadow-md sm:max-w-4xl mx-auto">
              <CommandInput
                className="text-md"
                placeholder={`Cari doa ${d.source}...`}
              />
              <CommandList className="max-h-[calc(100vh-240px)] h-full">
                <CommandEmpty>No results found.</CommandEmpty>
                <React.Fragment key={d.label}>
                  <CommandSeparator />
                  <CommandGroup className="capitalize" heading={d.label}>
                    {d.data.map((doa, index) => {
                      const value = index + doa.source;
                      return (
                        <CommandItem
                          key={index}
                          value={value}
                          className="w-full border-b"
                        >
                          <div className="group relative py-4 px-2 sm:px-4 rounded-md w-full">
                            <h4 className="font-medium text-lg mb-2">
                              {doa.judul}
                            </h4>
                            <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
                              <p
                                className="relative mt-2 font-lpmq text-right text-primary"
                                dangerouslySetInnerHTML={{
                                  __html: doa.arab,
                                }}
                              />
                            </div>
                            <div className="mt-3 space-y-3">
                              <div
                                className="translation-text prose text-muted-foreground max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: doa.indo,
                                }}
                              />
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </React.Fragment>
              </CommandList>
            </Command>
          </TabsContent>
        </React.Fragment>
      ))}
    </Tabs>
  );
}
