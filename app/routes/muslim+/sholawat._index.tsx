import data from "#/app/constants/sholawat";
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
  const sholawat = data;

  return (
    <div>
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize mb-4">
        Sholawat
      </h1>

      {sholawat.map((ayat, index) => {
        return (
          <li
            key={index}
            style={{ animationDelay: `${index * 0.1}s` }}
            className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-accent rounded-md `}
          >
            <h2 className="font-bold mb-2 prose-lg">{ayat.nama}</h2>
            <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
              <p className="relative mt-2 font-lpmq text-right">{ayat.arab}</p>
            </div>
            <div className="">
              <div
                className="latin-text mt-3 prose-sm text-muted-foreground text-right"
                dangerouslySetInnerHTML={{
                  __html: ayat.latin,
                }}
              />
              <div
                className="translation-text mt-3 prose-sm text-muted-foreground/80 text-right italic"
                dangerouslySetInnerHTML={{
                  __html: ayat.arti,
                }}
              />
            </div>
          </li>
        );
      })}
    </div>
  );
}
