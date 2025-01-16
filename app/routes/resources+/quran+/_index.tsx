import ky from "ky";
import { combineHeaders } from "#app/utils/misc.tsx";
import { makeTimings, time } from "#app/utils/timing.server.ts";
import { type LoaderFunctionArgs } from "@remix-run/node";

export type Ayah = {
  number: string;
  name: string;
  name_latin: string;
  number_of_ayah: string;
  text: { [key: string]: string };
  translations: {
    id: {
      name: string;
      text: { [key: string]: string };
    };
  };
  tafsir: {
    id: {
      kemenag: {
        name: string;
        source: string;
        text: { [key: string]: string };
      };
    };
  };
};

type Surah = Record<string, Ayah>; // Object with dynamic string keys

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const api = ky.create({
    prefixUrl:
      "https://raw.githubusercontent.com/rioastamal/quran-json/refs/heads/master/surah",
  });

  const url = new URL(request.url);
  const ayah_number = url.searchParams.get("ayah");
  const surah_number = url.searchParams.get("surah");

  if (!surah_number) {
    throw new Response("Not Found", { status: 404 });
  }

  const timings = makeTimings("surah loader");
  const surah_data = await time(
    () => api.get(`${surah_number}.json`).json<Surah>(),
    {
      timings,
      type: "get_data_surah",
      desc: "Get data surah by surah number",
    },
  );

  const parse = Object.values(surah_data);
  const ayah = parse[0];

  if (!ayah) {
    throw new Response("Not Found", { status: 404 });
  }

  const data = {
    ...ayah,
  };

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: combineHeaders(
      { "Server-Timing": timings.toString() },
      {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=31560000",
      },
    ),
  });
}
