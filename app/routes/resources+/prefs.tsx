import React from "react";
import { Icon } from "#app/components/ui/icon.tsx";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { type Theme, setTheme, getTheme } from "#app/utils/theme.server.ts";
import { useForm, getFormProps } from "@conform-to/react";
import { prefs } from "#app/utils/prefs.server";
import { Switch } from "#app/components/ui/switch";
import { Label } from "#app/components/ui/label";
import { Button } from "#app/components/ui/button";
import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "#app/components/ui/select";
import { Settings2 } from "lucide-react";
import {
  Popover,
  PopoverDialog,
  PopoverTrigger,
} from "#app/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#app/components/ui/card";
import {
  json,
  type ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { useFetcher, useFetchers, useRouteLoaderData } from "@remix-run/react";

const ThemeFormSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
});

// write the state to the cookie
export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await prefs.parse(cookieHeader)) || {};
  const formData = await request.formData();
  const all = Object.fromEntries(formData);
  // return json({ options: all });

  // const isOpen = formData.get("sidebar") === "open";
  cookie.opts = all;

  return json(all, {
    headers: {
      "Set-Cookie": await prefs.serialize(cookie),
    },
  });
}
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
    <fetcher.Form action="/" method="POST" {...getFormProps(form)}>
      <input type="hidden" name="theme" value={nextMode} />
      <div className="flex gap-2">
        <Button
          type="submit"
          variant="outline"
          className="bg-transparent"
          size="icon"
        >
          {modeLabel[mode]}
        </Button>
      </div>
    </fetcher.Form>
  );
}

// read the state from the cookie

import { fontOptions, fontSizeOpt } from "#/app/constants/prefs";

export function DisplaySetting({ themeSwitchOnly }) {
  // Daftar variasi font dengan nama dan font-weight yang sesuai
  const loaderRoot = useRouteLoaderData("root");
  const opts = loaderRoot?.opts || {};

  const fetcher = useFetcher();
  // Mengelola state untuk font weight
  const [fontWeight, setFontWeight] = React.useState<string>(
    opts?.font_weight || "400",
  ); // Default ke "Normal"
  const [fontSize, setFontSize] = React.useState<string>(
    opts?.font_size || "text-2xl",
  ); // Default ke "Normal"
  const [showTranslation] = React.useState<boolean>(
    opts?.font_translation && opts?.font_translation === "on" ? true : false,
  ); // Default ke "Normal"
  const [showLatin] = React.useState<boolean>(
    opts?.font_latin && opts?.font_latin === "on" ? true : false,
  ); // Default ke "Normal"

  return (
    <div className="flex items-center gap-x-1">
      {!themeSwitchOnly && (
        <PopoverTrigger>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="bg-transparent"
          >
            <Settings2 size={20} />
          </Button>
          <Popover placement="bottom">
            <PopoverDialog className="p-1">
              <fetcher.Form method="post" action="/resources/prefs">
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>
                      Manage your display settings here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-5">
                    <div className="space-y-4 w-full">
                      <Select
                        className="w-full"
                        placeholder="Select an font"
                        name="font_weight"
                        selectedKey={fontWeight}
                        onSelectionChange={(selected) =>
                          setFontWeight(selected)
                        }
                      >
                        <Label>Font Weight</Label>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectPopover>
                          <SelectListBox>
                            {fontOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                id={option.value}
                                textValue={option.value}
                              >
                                <span style={{ fontWeight: option.value }}>
                                  {option.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectListBox>
                        </SelectPopover>
                      </Select>

                      <Select
                        className="w-full"
                        placeholder="Select an font"
                        name="font_size"
                        selectedKey={fontSize}
                        onSelectionChange={(selected) => setFontSize(selected)}
                      >
                        <Label>Font Size</Label>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectPopover>
                          <SelectListBox>
                            {fontSizeOpt.map((option) => (
                              <SelectItem
                                key={option.label}
                                id={option.label}
                                textValue={option.label}
                              >
                                <span className="capitalize">
                                  {option.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectListBox>
                        </SelectPopover>
                      </Select>
                      <div className="flex items-center justify-between space-x-2">
                        <Label
                          htmlFor="translationtext"
                          className="flex flex-col space-y-0.5"
                        >
                          <span>Display translation text</span>
                          <span className="font-normal text-sm leading-snug text-muted-foreground">
                            Display or hide translation text.
                          </span>
                        </Label>
                        <Switch
                          name="font_translation"
                          id="translationtext"
                          defaultChecked={showTranslation}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label
                          htmlFor="latintext"
                          className="flex flex-col space-y-0.5"
                        >
                          <span>Display latin text</span>
                          <span className="font-normal leading-snug text-muted-foreground">
                            Display or hide latin text.
                          </span>
                        </Label>
                        <Switch
                          id="latintext"
                          name="font_latin"
                          defaultChecked={showLatin}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="w-full">
                    <Button type="submit" className="w-full">
                      Save
                    </Button>
                  </CardFooter>
                </Card>
              </fetcher.Form>
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>
      )}
      <ThemeSwitch userPreference={loaderRoot.requestInfo.userPrefs.theme} />
    </div>
  );
}
