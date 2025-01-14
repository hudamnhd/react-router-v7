import { data } from "#/app/constants/tahlil";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import { Link, useRouteLoaderData } from "@remix-run/react";
import { buttonVariants } from "#app/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { fontSizeOpt } from "#/app/constants/prefs";
import { cn } from "#app/utils/misc.tsx";

import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Tahlil | Doti App" }];

export default function Route() {
  const loaderRoot = useRouteLoaderData("root");
  const opts = loaderRoot?.opts || {};
  const tahlil = data;
  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);

  return (
    <div className="prose-base dark:prose-invert w-full max-w-xl mx-auto border-x">
      <div className="px-1.5 pt-2.5 pb-2 flex justify-between gap-x-3 sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center gap-x-2">
          <Link
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
              "prose-none [&_svg]:size-6 bg-transparent",
            )}
            to="/muslim"
          >
            <ChevronLeft />
          </Link>
          <span className="text-lg font-semibold capitalize">Tahlil</span>
        </div>

        <DisplaySetting />
      </div>
      <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3">
        Tahlil
      </div>

      {tahlil.map((ayat, index) => {
        const arabicContent = ayat?.arabic;
        const translateContent = ayat?.translation;
        return (
          <div
            key={index}
            className="group relative px-4 py-4 sm:py-4 sm:px-5 rounded-md border-t"
          >
            <div>
              <div className="font-semibold text-lg leading-6">
                {ayat.title}
              </div>
            </div>
            <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
              <div
                className={cn(
                  "relative text-right text-primary my-5 font-lpmq",
                )}
                style={{
                  fontWeight: opts.font_weight,
                  fontSize: font_size_opts?.fontSize || "1.5rem",
                  lineHeight: font_size_opts?.lineHeight || "3.5rem",
                }}
              >
                {arabicContent}
              </div>
            </div>
            {opts?.font_translation === "on" && (
              <div
                className="translation-text prose leading-7 max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: translateContent,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
