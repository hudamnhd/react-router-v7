import { json } from "@remix-run/node";
import ky from "ky";
export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}
const preBismillah = {
  text: {
    ar: "\ufeff\u0628\u0650\u0633\u0652\u0645\u0650\u0020\u0627\u0644\u0644\u0651\u064e\u0647\u0650\u0020\u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650\u0020\u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650",
    read: "Bismillaahir Rahmaanir Raheem",
  },
  translation: {
    en: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
  },
};

import cache from "#app/utils/cache-server.ts";
export async function loader() {
  const cacheKey = "quran-surat";
  const cacheData = cache.get(cacheKey);

  if (cacheData) {
    return json(cacheData, {
      headers: {
        "Cache-Control": "public, max-age=31560000",
      },
    });
  }

  const response = await ky
    .get(
      "https://raw.githubusercontent.com/rzkytmgr/quran-api/refs/heads/deprecated/data/quran.json",
    )
    .json();
  const quran = response.map((d) => {
    const obj = {
      number: d.number,
      ayahCount: d.ayahCount,
      asma: {
        ar: {
          short: d.asma.ar.short,
        },
        id: {
          short: d.asma.id.short,
        },
        translation: {
          id: d.asma.translation.id,
        },
      },
      // preBismillah: d.preBismillah ? preBismillah : d.preBismillah,
      preBismillah: d.preBismillah,
      type: {
        id: d.type.id,
      },
      // tafsir: {
      //   id: d.tafsir?.id,
      // },
    };
    return obj;
  });

  // Validasi respons
  if (!quran) {
    throw new Response("Not Found", { status: 404 });
  }

  // Gabungkan data

  cache.set(cacheKey, quran);
  cache.set("quran-ayah", response);
  return json(quran, {
    headers: {
      "Cache-Control": "public, max-age=31560000",
    },
  });
}
