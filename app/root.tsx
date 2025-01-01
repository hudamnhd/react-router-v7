import React from "react";
import { useForm, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { invariantResponse } from "@epic-web/invariant";
import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type HeadersFunction,
  type LinksFunction,
  type MetaFunction,
} from "@remix-run/node";
import {
  NavLink,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useFetchers,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { HoneypotProvider } from "remix-utils/honeypot/react";
import { z } from "zod";
import { GeneralErrorBoundary } from "./components/error-boundary.tsx";
import { EpicProgress } from "./components/progress-bar.tsx";
import { useToast } from "./components/toaster.tsx";
import { Icon, href as iconsHref } from "./components/ui/icon.tsx";
import { EpicToaster } from "./components/ui/sonner.tsx";
import tailwindStyleSheetUrl from "./styles/tailwind.css?url";
import { ClientHintCheck, getHints, useHints } from "./utils/client-hints.tsx";
import { getEnv } from "./utils/env.server.ts";
import { honeypot } from "./utils/honeypot.server.ts";
import { getDomainUrl } from "./utils/misc.tsx";
import { useNonce } from "./utils/nonce-provider.ts";
import { useRequestInfo } from "./utils/request-info.ts";
import { type Theme, setTheme, getTheme } from "./utils/theme.server.ts";
import { getToast } from "./utils/toast.server.ts";
export const links: LinksFunction = () => {
  return [
    // Preload svg sprite as a resource to avoid render blocking
    { rel: "preload", href: iconsHref, as: "image" },
    // Preload CSS as a resource to avoid render blocking
    // { rel: "mask-icon", href: "/favicons/mask-icon.svg" },
    {
      rel: "alternate icon",
      type: "image/png",
      href: "/favicons/favicon-32x32.png",
    },
    { rel: "apple-touch-icon", href: "/favicons/apple-touch-icon.png" },
    {
      rel: "manifest",
      href: "/site.webmanifest",
      crossOrigin: "use-credentials",
    } as const, // necessary to make typescript happy
    //These should match the css preloads above to avoid css as render blocking resource
    { rel: "icon", type: "image/svg+xml", href: "/favicons/favicon.svg" },

    { rel: "stylesheet", href: tailwindStyleSheetUrl },
  ].filter(Boolean);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data ? "Doti App" : "Error | Doti App" },
    {
      name: "description",
      content: `Doti - Simplify your day and achieve your goals with ease! A platform to track daily habits, manage tasks, and stay motivated. Build positive routines and get things done with Doti.`,
    },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { toast, headers: toastHeaders } = await getToast(request);
  const honeyProps = honeypot.getInputProps();

  return json(
    {
      requestInfo: {
        hints: getHints(request),
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname,
        userPrefs: {
          theme: getTheme(request),
        },
      },
      ENV: getEnv(),
      nonce: context.cspNonce,
      toast,
      honeyProps,
    },
    {
      headers: toastHeaders ?? {},
    },
  );
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const headers = {
    "Server-Timing": loaderHeaders.get("Server-Timing") ?? "",
  };
  return headers;
};

const ThemeFormSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: ThemeFormSchema,
  });

  invariantResponse(submission.status === "success", "Invalid theme received");

  const { theme } = submission.value;

  const responseInit = {
    headers: { "set-cookie": setTheme(theme) },
  };
  return json({ result: submission.reply() }, responseInit);
}

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
function useTheme() {
  const hints = useHints();
  const requestInfo = useRequestInfo();
  const optimisticMode = useOptimisticThemeMode();
  if (optimisticMode) {
    return optimisticMode === "system" ? hints.theme : optimisticMode;
  }
  return requestInfo.userPrefs.theme ?? hints.theme;
}

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
function useOptimisticThemeMode() {
  const fetchers = useFetchers();
  const themeFetcher = fetchers.find((f) => f.formAction === "/");

  if (themeFetcher && themeFetcher.formData) {
    const submission = parseWithZod(themeFetcher.formData, {
      schema: ThemeFormSchema,
    });

    if (submission.status === "success") {
      return submission.value.theme;
    }
  }
}

function ThemeSwitch({ userPreference }: { userPreference?: Theme | null }) {
  const fetcher = useFetcher<typeof action>();

  const [form] = useForm({
    id: "theme-switch",
    lastResult: fetcher.data?.result,
  });

  const optimisticMode = useOptimisticThemeMode();
  const mode = optimisticMode ?? userPreference ?? "system";
  const nextMode =
    mode === "system" ? "light" : mode === "light" ? "dark" : "system";
  const modeLabel = {
    light: (
      <Icon name="sun">
        <span className="sr-only">Light</span>
      </Icon>
    ),
    dark: (
      <Icon name="moon">
        <span className="sr-only">Dark</span>
      </Icon>
    ),
    system: (
      <Icon name="laptop">
        <span className="sr-only">System</span>
      </Icon>
    ),
  };

  return (
    <fetcher.Form method="POST" {...getFormProps(form)}>
      <input type="hidden" name="theme" value={nextMode} />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex h-8 w-8 cursor-pointer items-center justify-center"
        >
          {modeLabel[mode]}
        </button>
      </div>
    </fetcher.Form>
  );
}

export function ErrorBoundary() {
  // the nonce doesn't rely on the loader so we can access that
  const nonce = useNonce();

  // NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
  // likely failed to run so we have to do the best we can.
  // We could probably do better than this (it's possible the loader did run).
  // This would require a change in Remix.

  // Just make sure your root route never errors out and you'll always be able
  // to give the user a better UX.

  return (
    <Document nonce={nonce}>
      <GeneralErrorBoundary />
    </Document>
  );
}

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "#app/components/ui/navigation-menu";

import { Button } from "#app/components/ui/button";
import { Separator } from "#app/components/ui/separator";
import { muslimLinks, toolsLinks } from "#app/constants/nav-link";

function Navbar({ children }) {
  return (
    <React.Fragment>
      <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-wrapper">
          <div className="px-3 2xl:px-0 2xl:container flex h-14 items-center">
            <div className="mr-4 hidden md:flex">
              <NavLink className="mr-4 flex items-center gap-2 lg:mr-6" to="/">
                <Frame className="w-5 h-5 text-foreground -translate-y-[1px]" />
                <span className="hidden font-bold lg:inline-block sm:text-sm text-base">
                  Doti
                </span>
              </NavLink>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent">
                      Muslim
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-2.5 p-2.5 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                        {muslimLinks.map((component) => (
                          <li key={component.title} title={component.title}>
                            <NavigationMenuLink asChild>
                              <NavLink
                                to={component.href}
                                className={cn(
                                  "flex gap-1.5 select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                )}
                              >
                                <component.icon
                                  size={20}
                                  className="flex-none translate-y-[2px]"
                                />
                                <div>
                                  <div className="font-medium leading-none mb-1">
                                    {component.title}
                                  </div>
                                  <p className="line-clamp-2 leading-snug text-muted-foreground">
                                    {component.description}
                                  </p>
                                </div>
                              </NavLink>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent">
                      Alat
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                        {toolsLinks.map((component) => (
                          <li key={component.title} title={component.title}>
                            <NavigationMenuLink asChild>
                              <NavLink
                                to={component.href}
                                className={cn(
                                  "flex gap-1.5 select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                )}
                              >
                                <component.icon
                                  size={20}
                                  className="flex-none translate-y-[2px]"
                                />
                                <div>
                                  <div className="font-medium leading-none">
                                    {component.title}
                                  </div>
                                  <p className="line-clamp-2 leading-snug text-muted-foreground">
                                    {component.description}
                                  </p>
                                </div>
                              </NavLink>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            <NavbarMobile />
            <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
              <div className="w-full flex-1 md:w-auto md:flex-none">
                <CommandMenu />
              </div>
              <nav className="flex items-center gap-0.5">{children}</nav>
            </div>
          </div>
        </div>
      </header>
    </React.Fragment>
  );
}
import { TimerReset, Menu, Frame } from "lucide-react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { cn } from "#app/utils/misc.tsx";

import * as Dialog from "@radix-ui/react-dialog";

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
} from "#app/components/ui/command";

function CommandMenu({ ...props }: DialogProps) {
  const navigate = useNavigate();

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
          "relative h-8 w-full justify-start rounded-md bg-muted/50 font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64 sm:text-sm text-base",
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex">Cari ...</span>
        <span className="inline-flex lg:hidden">Cari ...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.45rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-sm">⌘</span>K
        </kbd>
      </Button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
          <Dialog.Content className="fixed sm:left-[50%] sm:top-[50%] z-50 w-full sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] border sm:border-none bg-background sm:rounded-xl inset-x-0 top-0 rounded-b-xl shadow-2xl p-2 sm:p-0 bg-background">
            <Command className="rounded-lg my-1.5 sm:my-0">
              <CommandInput
                placeholder="Cari menu..."
                className="sm:text-sm text-base"
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandSeparator />
                <CommandGroup heading="Daftar menu">
                  {[...muslimLinks, ...toolsLinks].map((navItem, index) => (
                    <CommandItem
                      key={index}
                      value={index}
                      className="flex items-center gap-2.5 p-2.5"
                      onSelect={() => {
                        runCommand(() => navigate(navItem.href as string));
                      }}
                    >
                      <navItem.icon />
                      <span>{navItem.title}</span>
                    </CommandItem>
                  ))}
                  <CommandItem
                    className="hover:bg-indigo-600 hover:text-foreground dark:hover:bg-indigo-400 flex items-center gap-2.5 py-2.5 sm:text-sm text-base"
                    onSelect={() => {
                      runCommand(() => navigate("/resources/reset" as string));
                    }}
                  >
                    <TimerReset />
                    <span>Reset data</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

function NavbarMobile() {
  const [open, setOpen] = React.useState(false);
  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);
  return (
    <React.Fragment>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button className="md:hidden -ml-2 mr-2 flex h-8 w-8 cursor-pointer items-center justify-center">
            <Menu size={20} />
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
          <Dialog.Content className="fixed z-50 w-full bg-background sm:rounded-md inset-x-0 bottom-0 rounded-t-xl px-2 pb-4 outline-none">
            <Dialog.Close className="flex items-center justify-center w-full outline-none">
              <div className="mx-auto mt-4 mb-3 h-2 w-[100px] rounded-full bg-muted" />
            </Dialog.Close>
            <nav className="flex flex-col items-start gap-0.5">
              {[...muslimLinks, ...toolsLinks].map((item) => (
                <NavLink
                  onClick={runCommand}
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    [
                      isActive ? "font-semibold bg-muted" : "",
                      "font-medium transition-colors hover:text-primary w-full px-4 py-2 rounded-md flex items-center gap-x-1.5",
                    ].join(" ")
                  }
                >
                  <item.icon
                    size={20}
                    className="flex-none translate-y-[2px]"
                  />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </nav>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </React.Fragment>
  );
}

function AppWithProviders() {
  const data = useLoaderData<typeof loader>();

  return (
    <HoneypotProvider {...data.honeyProps}>
      <App />
    </HoneypotProvider>
  );
}

// export default withSentry(AppWithProviders);
export default AppWithProviders;

function Document({
  children,
  nonce,
  theme = "light",
  env = {},
}: {
  children: React.ReactNode;
  nonce: string;
  theme?: Theme;
  env?: Record<string, string>;
  allowIndexing?: boolean;
}) {
  // const allowIndexing = ENV.ALLOW_INDEXING !== "false";
  const allowIndexing = env.ALLOW_INDEXING !== "false";
  return (
    <html lang="en" className={`${theme} h-full overflow-x-hidden`}>
      <head>
        <ClientHintCheck nonce={nonce} />
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {allowIndexing ? null : (
          <meta name="robots" content="noindex, nofollow" />
        )}
        <Links />
      </head>
      <body className="bg-background text-foreground ">
        {children}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(env)}`,
          }}
        />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  // if there was an error running the loader, data could be missing
  const data = useLoaderData<typeof loader | null>();
  // const nonce = useNonce();
  const nonce = data.nonce;
  const theme = useTheme();
  return (
    <Document theme={theme} nonce={nonce} env={data?.ENV}>
      {children}
    </Document>
  );
}

function App() {
  const data = useLoaderData<typeof loader>();
  const theme = useTheme();
  useToast(data.toast);

  return (
    <React.Fragment>
      <Navbar>
        <ThemeSwitch userPreference={data.requestInfo.userPrefs.theme} />
      </Navbar>
      <div className="px-3 2xl:px-0 2xl:container">
        <Outlet />
      </div>
      <EpicToaster closeButton position="top-center" theme={theme} />
      <EpicProgress />
    </React.Fragment>
  );
}
