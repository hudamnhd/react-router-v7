import { data } from "#/app/constants/dzikr.ts";
import React from "react";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import { Button, buttonVariants } from "#app/components/ui/button";
import { useRouteLoaderData, Link, useLoaderData } from "@remix-run/react";
import { fontSizeOpt } from "#/app/constants/prefs";
import { cn } from "#app/utils/misc.tsx";
import { Sun, Moon, Plus, ChevronLeft } from "lucide-react";
import { json } from "@remix-run/node";

import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Dzikir | Doti App" }];

function getWaktuSekarang(): string {
  const currentHour = new Date().getHours(); // Mendapatkan jam saat ini (0-23)

  if (currentHour >= 3 && currentHour < 15) {
    return "pagi"; // Jam 3 pagi hingga jam 3 sore
  } else {
    return "petang"; // Jam 3 sore hingga jam 3 pagi
  }
}

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

export async function loader() {
  const time = getWaktuSekarang();
  return json(
    { time },
    {
      headers: {
        "Cache-Control": "public, max-age=31560000",
      },
    },
  );
}

export default function DzikrView() {
  const { dzikr } = data;
  const { time } = useLoaderData();
  const loaderRoot = useRouteLoaderData("root");
  const opts = loaderRoot?.opts || {};

  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);
  React.useEffect(() => {
    const buttons = document.querySelectorAll(".tasbih-counter-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const counterDisplay = event.target
          .closest(".tasbih-counter-container")
          .querySelector(".counter-display");
        const currentValue = parseInt(counterDisplay.textContent || "0", 10);
        counterDisplay.textContent = (currentValue + 1).toString(); // Increment counter
      });
    });

    return () => {
      buttons.forEach((button) => {
        button.removeEventListener("click", () => {});
      });
    };
  }, []);

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
          <span className="text-lg font-semibold capitalize">
            Dzikir {time}
          </span>
        </div>

        <DisplaySetting />
      </div>
      <div className="flex items-center gap-x-3 justify-center text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3">
        <span>Dzikir {time}</span>
        {time === "pagi" ? <Sun /> : <Moon />}
      </div>

      {time === "pagi" ? (
        <div>
          {dzikr
            .filter((d) => d.time === "" || d.time === "pagi")
            .map((ayat, index) => {
              const fontWeight = opts.font_weight;
              const fontSize = font_size_opts?.fontSize || "1.5rem";
              const lineHeight = font_size_opts?.lineHeight || "3.5rem";
              const content = `<p style="font-weight:  ${fontWeight}; font-size: ${fontSize}; line-height:  ${lineHeight};" class="font-lpmq">`;
              const arabicContent = ayat?.arabic
                .replace(/@/g, "\n")
                .replace(/<p>/g, content);
              const translateContent = ayat?.translated_id
                .replace(/@/g, "<br/><br/>")
                .replace(/(\.)(\s|$)/g, "$1<br />");
              return (
                <div
                  key={index}
                  className="group tasbih-counter-container relative p-4 sm:p-5 border-t"
                >
                  <div>
                    <div className="space-y-0.5">
                      <div className="font-medium leading-none">
                        {ayat.title}
                      </div>
                      <div className="flex items-center gap-x-1 text-muted-foreground italic">
                        {ayat?.note && (
                          <span className="italic">{ayat.note}</span>
                        )}

                        {ayat.time !== "" && "Setiap "}
                        {ayat.time === "pagi" ? (
                          <span className="flex items-center gap-x-1.5 text-sm">
                            <span className="italic">Pagi</span>
                            <Sun className="w-4 h-4 rotate-0 transition-all" />
                          </span>
                        ) : (
                          ayat.time === "petang" && (
                            <span className="flex items-center gap-x-1.5 text-sm">
                              <span className="italic">Petang</span>
                              <Moon className="w-4 h-4 rotate-0 transition-all" />
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
                    <span
                      className={cn(
                        "relative text-right text-primary font-lpmq",
                      )}
                      style={{
                        fontWeight: opts.font_weight,
                        fontSize: font_size_opts?.fontSize || "1.5rem",
                        lineHeight: font_size_opts?.lineHeight || "3.5rem",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: arabicContent,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-4 mt-2">
                    <span className="counter-display text-2xl font-bold">
                      0
                    </span>
                    <button
                      className={cn(
                        buttonVariants({ size: "icon", variant: "outline" }),
                        "tasbih-counter-btn",
                      )}
                    >
                      <Plus />
                    </button>
                  </div>
                  {opts?.font_translation === "on" && (
                    <div className="">
                      <div className="translation-text">
                        <div
                          className="max-w-none  prose dark:prose-invert  text-accent-foreground"
                          dangerouslySetInnerHTML={{
                            __html: translateContent,
                          }}
                        />
                      </div>

                      <div
                        className="max-w-none  prose dark:prose-invert  text-muted-foreground italic pl-3 border-l-2"
                        dangerouslySetInnerHTML={{
                          __html: ayat.faedah,
                        }}
                      />
                      <div
                        className="max-w-none  prose dark:prose-invert  text-muted-foreground italic"
                        dangerouslySetInnerHTML={{
                          __html: ayat.narrator,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        <div>
          {dzikr
            .filter((d) => d.time === "" || d.time === "petang")
            .map((ayat, index) => {
              const fontWeight = opts.font_weight;
              const fontSize = font_size_opts?.fontSize || "1.5rem";
              const lineHeight = font_size_opts?.lineHeight || "3.5rem";
              const content = `<p style="font-weight:  ${fontWeight}; font-size: ${fontSize}; line-height:  ${lineHeight};" class="font-lpmq">`;
              const arabicContent = ayat?.arabic
                .replace(/@/g, "\n")
                .replace(/<p>/g, content);
              const translateContent = ayat?.translated_id
                .replace(/@/g, "<br/><br/>")
                .replace(/(\.)(\s|$)/g, "$1<br />");
              return (
                <div
                  key={index}
                  className="group tasbih-counter-container relative p-4 sm:p-5 border-t"
                >
                  <div>
                    <div className="space-y-0.5">
                      <div className="font-medium leading-none">
                        {ayat.title}
                      </div>
                      <div className="flex items-center gap-x-1 text-muted-foreground italic">
                        {ayat?.note && (
                          <span className="italic">{ayat.note}</span>
                        )}

                        {ayat.time !== "" && "Setiap "}
                        {ayat.time === "pagi" ? (
                          <span className="flex items-center gap-x-1.5 text-sm">
                            <span className="italic">Pagi</span>
                            <Sun className="w-4 h-4 rotate-0 transition-all" />
                          </span>
                        ) : (
                          ayat.time === "petang" && (
                            <span className="flex items-center gap-x-1.5 text-sm">
                              <span className="italic">Petang</span>
                              <Moon className="w-4 h-4 rotate-0 transition-all" />
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: arabicContent,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-4 mt-2">
                    <span className="counter-display text-2xl font-bold">
                      0
                    </span>
                    <button
                      className={cn(
                        buttonVariants({ size: "icon", variant: "outline" }),
                        "tasbih-counter-btn",
                      )}
                    >
                      <Plus />
                    </button>
                  </div>
                  {opts?.font_translation === "on" && (
                    <div className="mt-3 space-y-3">
                      <div className="translation-text">
                        <div
                          className="max-w-none  prose dark:prose-invert  text-accent-foreground"
                          dangerouslySetInnerHTML={{
                            __html: translateContent,
                          }}
                        />
                      </div>

                      <div
                        className="max-w-none  prose dark:prose-invert  text-muted-foreground italic pl-3 border-l-2"
                        dangerouslySetInnerHTML={{
                          __html: ayat.faedah,
                        }}
                      />
                      <div
                        className="max-w-none  prose dark:prose-invert  text-muted-foreground italic"
                        dangerouslySetInnerHTML={{
                          __html: ayat.narrator,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
