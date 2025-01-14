import ky from "ky";
import { data as daftar_surat } from "#app/constants/daftar-surat.json";
import { json, type LoaderFunctionArgs } from "@remix-run/node";

import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const surat = data?.surat;
  const surah_name = surat?.name_id;
  return [{ title: surah_name + " | Doti App" }];
};

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

type Word = {
  b: string; // bounding box width
  h: string; // bounding box height
  c: string; // Arabic text
  d: string; // Transliteration
  e: string; // English translation
};

type Ayat = {
  w: Word[]; // Array of words
  a: {
    g: string; // Global translation
  };
};

type Surah = Record<string, Ayat>; // Object with dynamic string keys

export async function loader({ params }: LoaderFunctionArgs) {
  const api = ky.create({
    prefixUrl:
      "https://raw.githubusercontent.com/qazasaz/quranwbw/refs/heads/master/surahs/data",
  });

  const { id } = params;

  const detail = daftar_surat.find((d) => d.number === id);
  const surat = await api.get(`${id}.json`).json<Surah>();

  const ayats = Object.values(surat) as Ayat[];

  const words = ayats.map((d) => {
    const original = d.w.map((w, index) => {
      let obj = {
        text: w.c,
        index,
      };
      return obj;
    });

    const shuffled = shuffleArray(original);
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

type TextType = {
  text: string;
  index: number;
};

const shuffleArray = (array: TextType[]) => {
  const shuffled = [...array]; // Membuat salinan array agar tidak memodifikasi yang asli
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Tukar elemen
  }
  return shuffled;
};
