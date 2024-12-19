import {
  useFetcher,
  useLoaderData,
  Outlet,
  NavLink,
  useNavigate,
} from "react-router";
import React from "react";

const navItems = [
  { to: "/muslim/sholawat", label: "Sholawat" },
  { to: "/muslim/doaharian", label: "Do'a Harian" },
  { to: "/muslim/dzikr", label: "Dzikr" },
  { to: "/muslim/tahlil", label: "Tahlil" },
  { to: "/muslim/quran-surat", label: "Qur'an" },
];

import { Button } from "~/components/ui/button";
import { Sun, Moon } from "lucide-react";
export default function Route() {
  const fetcher = useFetcher({ key: "theme-switch" });
  const theme = fetcher.data?.theme ?? useLoaderData();
  React.useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return (
    <React.Fragment>
      <div className="flex h-14 items-center px-4 border-b sticky top-0 bg-transparent backdrop-blur-md z-10">
        <div className="mr-4 hidden md:flex">
          <a className="mr-4 flex items-center gap-2 lg:mr-6" href="/">
            <BookOpenText className="w-5 h-5" />
            <span className="hidden font-bold lg:inline-block">Muslim</span>
          </a>
          <nav className="flex items-center gap-4 text-sm xl:gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    isActive ? "text-primary" : "text-muted-foreground/80",
                    "text-sm font-medium transition-colors hover:text-primary",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/*<NavbarMobile />*/}
        <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
          <CommandMenu />
          <nav className="flex items-center gap-0.5">
            <fetcher.Form action="/" method="POST">
              <input
                type="hidden"
                name="theme"
                value={theme === "dark" ? "light" : "dark"}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 transition-colors"
              >
                {theme === "dark" ? <Moon /> : <Sun />}
              </Button>
            </fetcher.Form>
          </nav>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 sm:p-4">
        <Outlet />
      </div>
    </React.Fragment>
  );
}

import { type DialogProps } from "@radix-ui/react-dialog";
import { BookOpenText, Dot } from "lucide-react";
import { cn } from "~/lib/utils";

// import { cn } from "~/lib/utils";
// import { Button } from "@/registry/new-york/ui/button";
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

function CommandMenu({ ...props }: DialogProps) {
  const navigate = useNavigate();

  const { data } = [];
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64",
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex">Search menu...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Cari menu..." />

        <CommandList className="max-h-[60vh]">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandSeparator />
          <CommandGroup heading="Daftar menu">
            {navItems.map((navItem, index) => (
              <CommandItem
                key={index}
                value={index}
                className="flex items-center gap-1.5"
                onSelect={() => {
                  runCommand(() =>
                    navigate(`/muslim/quran-surat/${navItem.id}` as string),
                  );
                }}
              >
                <Dot className="h-5 w-5" />
                <span>{navItem.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
