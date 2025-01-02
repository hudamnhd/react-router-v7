import data from "#/app/constants/sholawat";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import { useRouteLoaderData } from "@remix-run/react";
import { fontSizeOpt } from "#/app/constants/prefs";
import { cn } from "#app/utils/misc.tsx";

export default function Sholawat() {
  const loaderRoot = useRouteLoaderData("root");
  const opts = loaderRoot?.opts || {};
  const sholawat = data;

  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);
  return (
    <div className="prose dark:prose-invert max-w-4xl mx-auto border-x">
      <div className="m-1.5 flex justify-end">
        <DisplaySetting opts={opts} />
      </div>
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-4">
        Sholawat
      </h1>

      {sholawat.map((ayat, index) => {
        return (
          <div
            key={index}
            className="group relative px-4 pb-4 sm:px-5 rounded-md border-t"
          >
            <h4 className="font-bold mb-2 text-lg">{ayat.nama}</h4>
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
                {ayat.arab}
              </div>
            </div>
            <div className="">
              {opts?.font_latin === "on" && (
                <div
                  className="latin-text prose max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: ayat.latin,
                  }}
                />
              )}
              {opts?.font_translation === "on" && (
                <div
                  className="translation-text mt-3 prose max-w-none text-accent-foreground italic"
                  dangerouslySetInnerHTML={{
                    __html: ayat.arti,
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
