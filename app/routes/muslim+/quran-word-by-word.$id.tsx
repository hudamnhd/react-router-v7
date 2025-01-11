import { motion, useSpring, useScroll } from "framer-motion";
import { cn } from "#app/utils/misc.tsx";
import { Link, useLoaderData } from "@remix-run/react";
import React, { useState } from "react";
import { Button, buttonVariants } from "#app/components/ui/button";
import { Check, ChevronLeft, ChevronRight, Dot, X } from "lucide-react";
import ky from "ky";
import { data as daftar_surat } from "#app/constants/daftar-surat.json";
import { json, type LoaderFunctionArgs } from "@remix-run/node";

import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = ({ data }) => {
  const { surat } = data;
  const surah_name = surat?.name_id;
  return [{ title: surah_name + " | Doti App" }];
};

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

export async function loader({ params }: LoaderFunctionArgs) {
  const api = ky.create({
    prefixUrl:
      "https://raw.githubusercontent.com/qazasaz/quranwbw/refs/heads/master/surahs/data",
  });

  const { id } = params;

  const detail = daftar_surat.find((d) => d.number === id);
  const surat = await api.get(`${id}.json`).json();

  const ayats = Object.values(surat);

  const words = ayats.map((d) => {
    const original = d.w.map((w, index) => {
      let obj = {
        text: w.c,
        index,
      };
      return obj;
    });

    const shuffled = shuffleArray(original); // Acak urutan potongan
    return {
      original,
      shuffled,
    };
  });
  if (!surat) {
    throw new Response("Not Found", { status: 404 });
  }

  return json(
    { ayats: words, surat: detail },
    {
      headers: {
        "Cache-Control": "public, max-age=31560000",
      },
    },
  );
}

export default function RouteX() {
  const { ayats, surat } = useLoaderData();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="prose-base dark:prose-invert w-full border-x divide-y pb-10">
      <div className="text-3xl font-bold md:text-4xl w-fit mx-auto text-primary pb-3">
        {surat.name_id}
        <span className="ml-2 underline-offset-4 group-hover:underline font-indopak">
          ( {surat.name_short} )
        </span>
        <div className="flex items-center text-sm font-medium justify-center -mt-1">
          <span className="">{surat.translation_id}</span>
          <Dot />
          <span className="">Surat ke- {surat.number}</span>
          <Dot />
          <span>{surat.number_of_verses} Ayat</span>
        </div>
      </div>
      {/*<pre className="text-sm">{JSON.stringify({ surat, ayats }, null, 2)}</pre>*/}
      {ayats.map((d, index) => {
        return (
          <div dir="rtl" key={index}>
            <PuzzleGame
              ayat_shuffle={d.shuffled}
              ayat_text={d.original}
              ayat_number={index + 1}
            />
          </div>
        );
      })}

      <motion.div
        id="scroll-indicator"
        className="z-[60] bg-gradient-to-r from-fuchsia-500 to-cyan-500 dark:from-fuchsia-400 dark:to-cyan-400"
        style={{
          scaleX,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          originX: 0,
        }}
      />

      <div className="ml-auto flex items-center justify-center gap-3 py-5 border-t ">
        <Link
          className={cn(buttonVariants({ size: "icon", variant: "outline" }))}
          to={`/muslim/quran-word-by-word/${parseInt(surat.number) - 1}`}
          disabled={parseInt(surat.number) === 1}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft />
        </Link>

        <span className="text-accent-foreground text-sm">
          Surat <strong>{surat.number}</strong> dari <strong>114</strong>
        </span>
        <Link
          className={cn(buttonVariants({ size: "icon", variant: "outline" }))}
          to={`/muslim/quran-word-by-word/${parseInt(surat.number) + 1}`}
          disabled={parseInt(surat.number) === 114}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight />
        </Link>
      </div>
    </div>
  );
}

const shuffleArray = (array: string[]) => {
  const shuffled = [...array]; // Membuat salinan array agar tidak memodifikasi yang asli
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Tukar elemen
  }
  return shuffled;
};
interface PuzzleProps {
  ayat_text: string[];
}

const PuzzleGame: React.FC<PuzzleProps> = ({
  ayat_shuffle,
  ayat_text,
  ayat_number,
}) => {
  const [slices, setSlices] = useState<string[]>(ayat_shuffle || []);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean>(null);

  const handleClickSlice = (slice: string) => {
    // Jika bagian sudah ada di userAnswer, hapus dari urutan
    if (userAnswer.includes(slice)) {
      setUserAnswer(userAnswer.filter((item) => item !== slice));
      setSlices([...slices, slice]); // Kembalikan slice ke dalam slices
    } else {
      // Pindahkan slice ke urutan yang sudah disusun
      setUserAnswer([...userAnswer, slice]);
      setSlices(slices.filter((item) => item !== slice)); // Hapus slice dari slices
    }
  };

  const checkAnswer = () => {
    const correctAnswer = ayat_text;
    setIsCorrect(JSON.stringify(userAnswer) === JSON.stringify(correctAnswer));
  };

  // Gunakan useRef untuk menyimpan draggedIndex
  const draggedIndexRef = React.useRef<number | null>(null);

  // Fungsi untuk menangani drag start
  const handleDragStart = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>, index: number) => {
      draggedIndexRef.current = index; // Simpan index ke dalam ref
      // event.target.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      const element = event.currentTarget.cloneNode(true) as HTMLDivElement;
      const dragImage = document.createElement("div");

      const isDarkMode = document.documentElement.classList.contains("dark");

      // Atur warna berdasarkan tema
      if (isDarkMode) {
        dragImage.style.backgroundColor = "black";
        dragImage.style.border = "1px solid white";
        dragImage.style.color = "white"; // Warna teks jika ada
      } else {
        dragImage.style.backgroundColor = "white";
        dragImage.style.border = "1px solid black";
        dragImage.style.color = "black"; // Warna teks jika ada
      }
      const client_width = event.currentTarget.clientWidth + 25 + "px";
      dragImage.style.width = client_width;
      dragImage.style.padding = "10px"; // Hanya padding bawah
      dragImage.appendChild(element);
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, 25, 25);
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    },
    [],
  );

  // Fungsi untuk menangani drag over
  const handleDragOver = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault(); // Mengizinkan drop
      event.dataTransfer.dropEffect = "move";
    },
    [],
  );

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.target.classList.remove("dragging"); // Hapus kelas 'dragging'
    draggedIndexRef.current = null;
  };
  // Fungsi untuk menangani drop
  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      event.preventDefault();

      const draggedIndex = draggedIndexRef.current;
      if (draggedIndex === null || draggedIndex === dropIndex) return;

      // Gunakan callback untuk memastikan state terbaru digunakan
      setUserAnswer((prevItems) => {
        const updatedItems = [...prevItems];
        const [movedItem] = updatedItems.splice(draggedIndex, 1);
        updatedItems.splice(dropIndex, 0, movedItem);

        return updatedItems;
      });

      draggedIndexRef.current = null; // Reset drag index setelah selesai
    },
    [],
  );

  return (
    <div
      className={cn(
        " transition-all duration-300 relative flex flex-col items-start gap-2 animate-slide-top [animation-fill-mode:backwards] group relative py-5 pr-4 pl-2 sm:px-5",
        isCorrect && "bg-muted/30",
        isCorrect === false && "bg-destructive/5",
      )}
    >
      <div className="space-y-2">
        <div dir="rtl" className="flex flex-wrap gap-2 items-center">
          {/* Menampilkan potongan teks */}
          {slices.length === 0 ? (
            // Menampilkan pesan jika slices kosong
            <div className="text-center text-sm text-muted-foreground w-full">
              Cek Jawaban
            </div>
          ) : (
            slices.map((slice) => (
              <Button
                variant="outline"
                className="font-indopak py-8 px-2"
                key={slice.index}
                onPress={() => handleClickSlice(slice)}
              >
                {slice.text}
              </Button>
            ))
          )}

          {slices.length > 0 && (
            <span className="font-uthmani sm:inline-flex hidden">
              {toArabicNumber(ayat_number)}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 text-right border-t pt-2">
        <div className="flex flex-wrap gap-2 justify-start">
          {userAnswer.length > 0 && (
            <React.Fragment>
              {userAnswer.map((slice, index) => (
                <div
                  className={cn(
                    buttonVariants({ size: "lg", variant: "secondary" }),
                    "font-indopak py-8 px-2",
                  )}
                  draggable
                  key={slice.index}
                  onDragStart={(event) => handleDragStart(event, index)}
                  onDragEnd={(event) => handleDragEnd(event, index)}
                  onDragOver={handleDragOver}
                  onClick={() => handleClickSlice(slice)}
                  onDrop={(event) => handleDrop(event, index)}
                >
                  {slice.text}
                </div>
              ))}

              <span
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "font-uthmani py-7 px-2 hidden sm:inline-flex",
                )}
              >
                {toArabicNumber(ayat_number)}
              </span>
            </React.Fragment>
          )}
        </div>
      </div>

      {userAnswer.length > 0 ? (
        <Button
          dir="rtl"
          variant={
            isCorrect === true
              ? "outline"
              : isCorrect === false
                ? "destructive"
                : "secondary"
          }
          className="mt-3 transition-all duration-300"
          onPress={checkAnswer}
        >
          {isCorrect === null ? (
            "Cek Jawaban"
          ) : isCorrect ? (
            <>
              Correct <Check />
            </>
          ) : (
            <>
              Wrong <X />
            </>
          )}
        </Button>
      ) : (
        <div className="text-sm text-muted-foreground w-full">
          Belum ada Jawaban
        </div>
      )}

      <details className="group [&_summary::-webkit-details-marker]:hidden mt-2">
        <summary className="flex cursor-pointer items-center gap-1.5 outline-none">
          <svg
            className="size-4 shrink-0 transition duration-300 group-open:-rotate-180 text-indigo-600 dark:text-indigo-400 opacity-80"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>

          <div className="group-open:animate-slide-left [animation-fill-mode:backwards] group-open:block hidden font-medium text-sm text-indigo-600 dark:text-indigo-400">
            Hide Clue
          </div>
          <div className="animate-slide-left group-open:hidden font-medium text-sm text-indigo-600 dark:text-indigo-400">
            Show Clue
          </div>
        </summary>

        <div className="group-open:animate-slide-left group-open:[animation-fill-mode:backwards] group-open:transition-all group-open:duration-300  flex flex-wrap">
          {ayat_text.map((w, index) => (
            <span className="font-indopak mx-1 w-fit" key={w.text + index}>
              {w.text}
            </span>
          ))}

          <span className="font-uthmani mx-1">
            {toArabicNumber(ayat_number)}
          </span>
        </div>
      </details>
    </div>
  );
};

// Fungsi untuk mengonversi angka ke format Arab
const toArabicNumber = (number: number) => {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return number
    .toString()
    .split("")
    .map((digit) => arabicDigits[parseInt(digit)])
    .join("");
};
