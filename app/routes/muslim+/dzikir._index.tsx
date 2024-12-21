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
    <div>
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize mb-4">
        Dzikir {getWaktuSekarang()}
      </h1>

      {getWaktuSekarang() === "pagi" ? (
        <ul role="list" className="">
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
                <li
                  key={index}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-accent rounded-md `}
                >
                  <div>
                    <div className="space-y-1 mb-2">
                      <h4 className="font-medium leading-none">{ayat.title}</h4>
                      <div className="flex items-center gap-x-1 text-sm text-muted-foreground italic">
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
                      className="relative mt-2 text-right font-lpmq"
                      dangerouslySetInnerHTML={{
                        __html: arabicContent,
                      }}
                    />
                  </div>
                  <div className="mt-3 space-y-3">
                    <div
                      className="translation-text prose-sm text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: translateContent,
                      }}
                    />

                    {ayat.faedah && (
                      <Badge className="bg-lime-400 text-foreground dark:text-background">
                        Faedah
                      </Badge>
                    )}
                    <div
                      className="prose-sm text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: ayat.faedah,
                      }}
                    />
                    <div
                      className="text-sm text-muted-foreground italic"
                      dangerouslySetInnerHTML={{
                        __html: ayat.narrator,
                      }}
                    />
                  </div>
                </li>
              );
            })}
        </ul>
      ) : (
        <ul role="list" className="">
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
                <li
                  key={index}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-accent rounded-md `}
                >
                  <div>
                    <div className="space-y-1 mb-2">
                      <h4 className="font-medium leading-none">{ayat.title}</h4>
                      <div className="flex items-center gap-x-1 text-sm text-muted-foreground italic">
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
                    <p
                      className="relative mt-2 text-right font-lpmq"
                      dangerouslySetInnerHTML={{
                        __html: arabicContent,
                      }}
                    />
                  </div>
                  <div className="mt-3 space-y-3">
                    <div
                      className="translation-text text-sm text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: translateContent,
                      }}
                    />
                    <div
                      className="text-sm text-muted-foreground italic"
                      dangerouslySetInnerHTML={{
                        __html: ayat.faedah,
                      }}
                    />
                    <div
                      className="text-sm text-muted-foreground italic"
                      dangerouslySetInnerHTML={{
                        __html: ayat.narrator,
                      }}
                    />
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
