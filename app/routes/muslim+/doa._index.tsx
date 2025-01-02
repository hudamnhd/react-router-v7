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
  X,
  Circle,
  Heart,
  MapPin,
  Search,
  ExternalLink,
} from "lucide-react";

import {
  Dialog,
  Heading,
  DialogTrigger,
  Modal,
  ModalOverlay,
  ModalContext,
} from "react-aria-components";
import { cn } from "#app/utils/misc.tsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
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
  return (
    <React.Fragment>
      <div className="border-x border-b pb-4 rounded-b-xl max-w-4xl mx-auto">
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize my-2">
          Do'a
        </h1>

        <TabDemo result={result} />
      </div>
    </React.Fragment>
  );
}

const ListItem = ({ doa, index }) => {
  const Icon = sumberIcons[doa.source] || Circle; // Default ke Dot jika tidak match
  const trimmedJudul = doa.judul.replace(/\s+/g, " ").trim();
  let [isOpen, setOpen] = React.useState(false);
  const renderCount = React.useRef(0);
  const contentRef = React.useRef(null);
  const isDesktop = React.useRef(false);
  renderCount.current++;
  const content = contentRef.current;

  const runCommand = React.useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <React.Fragment>
      <ModalContext.Provider value={{ isOpen, onOpenChange: runCommand }}>
        <DialogResponsive isDesktop={isDesktop.current} content={content} />
      </ModalContext.Provider>
      <CommandItem
        value={trimmedJudul}
        className="flex items-start gap-1.5 text-md"
        onSelect={() => {
          isDesktop.current = window.innerWidth > 767;
          contentRef.current = doa;
          setOpen(true);
        }}
      >
        <Icon className="h-5 w-5 flex-none sm:flex hidden" />
        <span className="flex-none sm:hidden flex">·</span>
        <span className="mr-auto">{doa.judul}</span>
      </CommandItem>
    </React.Fragment>
  );
};

export const DialogResponsive = ({ content }) => {
  return (
    <React.Fragment>
      <DialogTrigger type="modal">
        <ModalOverlay
          isDismissable
          className={({ isEntering, isExiting }) =>
            cn(
              "fixed inset-0 z-50 bg-black/80",
              isEntering ? "animate-in fade-in duration-300 ease-out" : "",
              isExiting ? "animate-out fade-out duration-300 ease-in" : "",
            )
          }
        >
          <Modal
            className={({ isEntering, isExiting }) =>
              cn(
                "fixed sm:left-[50%] sm:top-[50%] z-50 w-full sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] border-b sm:border-none bg-background sm:rounded-md inset-x-0 bottom-0 shadow-xl bg-background p-2 sm:p-0 h-fit w-full sm:max-w-4xl",
                isEntering
                  ? "animate-in slide-in-from-bottom duration-300"
                  : "",
                isExiting ? "animate-out slide-out-to-bottom duration-300" : "",
              )
            }
          >
            <Dialog role="alertdialog" className="outline-none relative pb-5">
              {({ close }) => (
                <div className="grid gap-2.5 px-2">
                  <div className="w-fit mx-auto mt-4 ">
                    <Button
                      onPress={close}
                      size="sm"
                      className="h-2 w-[100px] rounded-full bg-muted  sm:hidden block"
                    />
                  </div>
                  <Heading>
                    <div className="grid gap-1.5 px-4 text-center sm:text-left">
                      <p className="text-lg">{content.judul}</p>
                      <p className="text-muted-foreground -mt-2">
                        sumber doa: {content.source}
                      </p>
                    </div>
                  </Heading>

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
                  <div className="flex sm:hidden items-center justify-center w-full outline-none">
                    <Button
                      onPress={close}
                      variant="outline"
                      className="w-full"
                    >
                      <X />
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
      {/*{isDesktop ? (
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
      )}*/}
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

function TabDemo({ result }) {
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
    <Tabs defaultValue="quran">
      <ScrollArea className="max-w-4xl mx-auto">
        <TabsList className=" mb-3 h-auto gap-2 rounded-none border-b border-border bg-transparent px-0 py-1 text-foreground">
          <TabsTrigger
            value="search"
            className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
          >
            <Search
              size={16}
              strokeWidth={2}
              className="-ms-0.5 me-1.5 opacity-60"
            />
            <span className="font-semibold capitalize text-sm">Cari</span>
          </TabsTrigger>
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
        <TabsContent
          key={d.label}
          value={d.source}
          className="max-w-4xl mx-auto"
        >
          {d.data.map((doa, index) => {
            const trimmedJudul = doa.judul.replace(/\s+/g, " ").trim();
            return (
              <div key={index} className="w-full border-b">
                <div className="group relative py-4 px-2 sm:px-4 rounded-md w-full">
                  <h4 className="font-medium text-lg mb-2">{trimmedJudul}</h4>
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
              </div>
            );
          })}
        </TabsContent>
      ))}
      <TabsContent value="search" className="p-0 m-0 px-4 pt-1">
        <Command className="rounded-lg border shadow-md">
          <CommandInput className="text-md" placeholder="Cari doa..." />
          <CommandList className="max-h-[calc(100vh-250px)] h-full">
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
        </Command>
      </TabsContent>
    </Tabs>
  );
}
