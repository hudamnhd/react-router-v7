import { data } from "#/app/constants/tahlil";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import { useRouteLoaderData } from "@remix-run/react";
import { fontSizeOpt } from "#/app/constants/prefs";
import { cn } from "#app/utils/misc.tsx";

export default function Route() {
  const loaderRoot = useRouteLoaderData("root");
  const opts = loaderRoot?.opts || {};
  const tahlil = data;
  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);

  return (
    <div className="prose dark:prose-invert max-w-4xl mx-auto border-x">
      <div className="p-1.5 flex justify-end">
        <DisplaySetting opts={opts} />
      </div>
      <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize border-t py-3">
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
              <div className="font-medium leading-none text-lg leading-6">
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
                className="translation-text prose text-muted-foreground max-w-none"
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
