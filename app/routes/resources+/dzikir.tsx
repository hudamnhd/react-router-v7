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

export async function loader({ request, params }: LoaderFunctionArgs) {
  const api = ky.create({ prefixUrl: "https://api.myquran.com/v2/quran" });
  const { id } = params;
  // Gunakan Promise.all untuk menangani beberapa permintaan secara paralel
  const [surat, ayat] = await Promise.all([
    api.get(`surat/${id}`).json(),
    api.get(`ayat/page/${id}`).json(),
  ]);

  // Validasi respons
  if (!surat.status || !ayat.status) {
    throw new Response("Not Found", { status: 404 });
  }

  // Gabungkan data
  const data = {
    ayat: ayat.data,
    surat: surat.data,
  };

  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=31560000",
    },
  });
}

import { getCache, setCache, constructKey } from "#app/utils/cache-client.ts";

export async function clientLoader({
  request,
  serverLoader,
}: ClientLoaderFunctionArgs) {
  const key = constructKey(request);

  const cachedData = await getCache(key);

  if (cachedData) {
    return cachedData; // (3)
  }

  const serverData = await serverLoader();
  await setCache(key, serverData);
  return serverData;
}

clientLoader.hydrate = true;
