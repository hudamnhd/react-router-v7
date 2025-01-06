import {
  json,
  type LoaderFunctionArgs,
  type ClientLoaderFunctionArgs,
} from "@remix-run/node";

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

import ky from "ky";
import { data as daftar_surat } from "#app/constants/daftar-surat.json";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const api = ky.create({ prefixUrl: "https://api.myquran.com/v2/quran" });
  const { id } = params;
  // Gunakan Promise.all untuk menangani beberapa permintaan secara paralel
  const ayat = await api.get(`ayat/page/${id}`).json();

  if (!ayat.status) {
    throw new Response("Not Found", { status: 404 });
  }
  const last_ayat = ayat.data[ayat.data.length - 1].surah;
  const surat = await api.get(`surat/${last_ayat}`).json();

  // Validasi respons
  if (!surat.status) {
    throw new Response("Not Found", { status: 404 });
  }

  const group_surat = ayat.data.reduce((result, item, index, array) => {
    const no_surah = item.surah; // Ambil nomor surah
    const detail = daftar_surat.find((d) => d.number === no_surah);

    // Jika belum ada surah di result, inisialisasi dengan detail dan array kosong
    if (!result[no_surah]) {
      result[no_surah] = { surah: detail, ayat: [] };
    }

    // Tambahkan ayat ke array surah
    result[no_surah].ayat.push(item);

    return result;
  }, {});

  const data = {
    group_surat,
  };

  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=31560000",
    },
  });
}

// import { get_cache, set_cache, construct_key } from "#app/utils/cache-client.ts";

// export async function clientLoader({
//   request,
//   serverLoader,
// }: ClientLoaderFunctionArgs) {
//   const key = construct_key(request);
//
//   const cachedData = await get_cache(key);
//
//   if (cachedData) {
//     return cachedData; // (3)
//   }
//
//   const serverData = await serverLoader();
//   await set_cache(key, serverData);
//   return serverData;
// }

// clientLoader.hydrate = true;
