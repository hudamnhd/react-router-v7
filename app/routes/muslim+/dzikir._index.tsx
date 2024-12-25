import { data } from "#/app/constants/dzikr.ts";
import { Sun, Moon } from "lucide-react";

function getWaktuSekarang(): string {
  const currentHour = new Date().getHours(); // Mendapatkan jam saat ini (0-23)

  if (currentHour >= 3 && currentHour < 15) {
    return "pagi"; // Jam 3 pagi hingga jam 3 sore
  } else {
    return "petang"; // Jam 3 sore hingga jam 3 pagi
  }
}

import { Badge } from "#app/components/ui/badge";

export default function DzikrView() {
  const { dzikr } = data;

  return (
    <div className="prose dark:prose-invert max-w-4xl mx-auto border-x">
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize my-4">
        Dzikir {getWaktuSekarang()}
      </h1>

      {getWaktuSekarang() === "pagi" ? (
        <div>
          {dzikr
            .filter((d) => d.time === "" || d.time === "pagi")
            .map((ayat, index) => {
              const arabicContent = ayat?.arabic
                .replace(/@/g, "\n")
                .replace(/<p>/g, '<p class="font-lpmq">'); // Menambahkan kelas 'font-lpmq' pada tag <p>
              const translateContent = ayat?.translated_id
                .replace(/@/g, "<br/><br/>")
                .replace(/(\.)(\s|$)/g, "$1<br />");
              return (
                <div key={index} className="group relative p-4 sm:p-5 border-t">
                  <div>
                    <div className="space-y-1 mb-2">
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
                    <div
                      className="relative mt-2 font-lpmq text-right text-primary"
                      dangerouslySetInnerHTML={{
                        __html: arabicContent,
                      }}
                    />
                  </div>

                  <div className="mt-3 space-y-3">
                    <div className="translation-text">
                      <div
                        className="max-w-none prose text-accent-foreground"
                        dangerouslySetInnerHTML={{
                          __html: translateContent,
                        }}
                      />
                    </div>

                    <div
                      className="max-w-none prose text-muted-foreground italic pl-3 border-l-2"
                      dangerouslySetInnerHTML={{
                        __html: ayat.faedah,
                      }}
                    />
                    <div
                      className="max-w-none prose text-muted-foreground italic"
                      dangerouslySetInnerHTML={{
                        __html: ayat.narrator,
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div>
          {dzikr
            .filter((d) => d.time === "" || d.time === "petang")
            .map((ayat, index) => {
              const arabicContent = ayat?.arabic
                .replace(/@/g, "\n")
                .replace(/<p>/g, '<p class="font-lpmq">'); // Menambahkan kelas 'font-lpmq' pada tag <p>
              const translateContent = ayat?.translated_id
                .replace(/@/g, "<br/><br/>")
                .replace(/(\.)(\s|$)/g, "$1<br />");
              return (
                <div key={index} className="group relative p-4 sm:p-5 border-t">
                  <div>
                    <div className="space-y-1 mb-2">
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
                      className="relative mt-2 text-right font-lpmq"
                      dangerouslySetInnerHTML={{
                        __html: arabicContent,
                      }}
                    />
                  </div>
                  <div className="mt-3 space-y-3">
                    <div className="translation-text">
                      <div
                        className="max-w-none prose text-accent-foreground"
                        dangerouslySetInnerHTML={{
                          __html: translateContent,
                        }}
                      />
                    </div>

                    <div
                      className="max-w-none prose text-muted-foreground italic pl-3 border-l-2"
                      dangerouslySetInnerHTML={{
                        __html: ayat.faedah,
                      }}
                    />
                    <div
                      className="max-w-none prose text-muted-foreground italic"
                      dangerouslySetInnerHTML={{
                        __html: ayat.narrator,
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
