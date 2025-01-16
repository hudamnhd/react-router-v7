import { cn } from "#app/utils/misc.tsx";
import {
  Popover,
  PopoverDialog,
  PopoverTrigger,
} from "#app/components/ui/popover";
import { Button, buttonVariants } from "#app/components/ui/button";
import {
  Link,
  useLoaderData,
  useNavigate,
  useRouteLoaderData,
} from "@remix-run/react";

import { FieldGroup, Label } from "#app/components/ui/field";
import {
  NumberField,
  NumberFieldInput,
  NumberFieldSteppers,
} from "#app/components/ui/number-field";
import { type loader as RootLoader } from "#app/root.tsx";
import React from "react";
import { DisplaySetting } from "#app/routes/resources+/prefs";
import {
  ChevronLeft,
  Bookmark,
  ChevronRight,
  MoveRight,
  Minus,
} from "lucide-react";
import ky from "ky";
import { combineHeaders } from "#app/utils/misc.tsx";
import { makeTimings, time } from "#app/utils/timing.server.ts";
import { data as daftar_surat } from "#app/constants/daftar-surat.json";
import type { LoaderFunctionArgs } from "@remix-run/node";

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

export type ResponseMyquran = {
  status: boolean;
  info: {
    min: number;
    max: number;
  };
  request: {
    path: string;
    page: string;
  };
  data: { [key: string]: null | string }[];
};

export type SurahDetail = {
  number: string; // Nomor surah
  name: string; // Nama surah
  [key: string]: unknown; // Properti lainnya (jika ada)
};

export type GroupedAyat = {
  [surah: string]: {
    surah: (typeof daftar_surat)[0] | undefined; // Detail surah atau undefined jika tidak ditemukan
    ayat: { [key: string]: null | string }[]; // Ayat-ayat dalam surah
  };
};

export async function loader({ params }: LoaderFunctionArgs) {
  const api = ky.create({ prefixUrl: "https://api.myquran.com/v2/quran" });

  const { id } = params;

  const timings = makeTimings("surah loader");
  const ayat = await time(
    () => api.get(`ayat/page/${id}`).json<ResponseMyquran>(),
    {
      timings,
      type: "get_data_surah",
      desc: "Get data surah by surah number",
    },
  );

  if (!ayat.status) {
    throw new Response("Not Found", { status: 404 });
  }

  // Fungsi untuk mengelompokkan ayat berdasarkan surah
  const group_surat: GroupedAyat = ayat.data.reduce(
    (result: GroupedAyat, item) => {
      const no_surah = item.surah as string; // Nomor surah
      const detail = daftar_surat.find((d) => d.number === no_surah); // Cari detail surah

      if (!result[no_surah]) {
        result[no_surah] = { surah: detail, ayat: [] };
      }

      result[no_surah].ayat.push(item);

      return result;
    },
    {} as GroupedAyat,
  );

  const data = {
    group_surat,
    id,
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

import { fontSizeOpt } from "#/app/constants/prefs";

export default function Index() {
  const { group_surat, id } = useLoaderData<{
    group_surat: GroupedAyat;
    id: string;
  }>();
  const loaderRoot = useRouteLoaderData<typeof RootLoader>("root");
  const opts = loaderRoot?.opts || {};
  const font_size_opts = fontSizeOpt.find((d) => d.label === opts?.font_size);
  const toAyatRef = React.useRef<number>(id);
  const navigate = useNavigate();
  const maxValue = 604;

  return (
    <div className="prose dark:prose-invert md:max-w-xl mx-auto border-x min-h-screen">
      <div className="px-1.5 pt-2.5 pb-2 flex justify-between gap-x-3 sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center gap-x-2">
          <Link
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
              "prose-none [&_svg]:size-6 bg-transparent",
            )}
            to="/muslim/quran"
          >
            <ChevronLeft />
          </Link>
          <span className="text-lg font-semibold line-clamp-1">Hal {id}</span>
        </div>

        <div className="flex gap-1">
          {/*<Button variant="outline" size="icon" className="bg-transparent">
            <Bookmark />
          </Button>*/}
          <PopoverTrigger>
            <Button variant="outline" size="icon" className="bg-transparent">
              <MoveRight />
            </Button>
            <Popover isNonModal={false} placement="bottom">
              <PopoverDialog className="max-w-[120px] space-y-1.5 bg-background rounded-md">
                {({ close }) => (
                  <React.Fragment>
                    <NumberField
                      onChange={(value) => {
                        toAyatRef.current = value;
                      }}
                      defaultValue={toAyatRef.current}
                      minValue={1}
                      maxValue={maxValue}
                    >
                      <Label>Ke Halaman</Label>
                      <FieldGroup>
                        <NumberFieldInput />
                        <NumberFieldSteppers />
                      </FieldGroup>
                    </NumberField>
                    <Button
                      className="w-full"
                      onPress={() => {
                        close();
                        navigate("/muslim/quran-v2/" + toAyatRef.current);
                      }}
                    >
                      Submit
                    </Button>
                  </React.Fragment>
                )}
              </PopoverDialog>
            </Popover>
          </PopoverTrigger>
          <DisplaySetting />
        </div>
      </div>

      {Object.values(group_surat).map((d) => {
        const first_ayah = d.ayat[0]?.ayah;
        const last_ayah = d.ayat[d.ayat.length - 1]?.ayah;
        return (
          <React.Fragment key={d?.surah?.number}>
            <div className="prose dark:prose-invert max-w-none">
              <div className="text-3xl font-bold w-fit mx-auto pb-1">
                {d?.surah?.name_id}
                <span className="ml-2 underline-offset-4 group-hover:underline font-lpmq">
                  ( {d?.surah?.name_short} )
                </span>
                <div className="flex items-center text-base font-medium justify-center -mt-3">
                  <span>Ayah {first_ayah}</span>
                  <Minus />
                  <span>{last_ayah}</span>
                </div>
              </div>

              <div
                className="rtl:text-justify leading-relaxed px-5 py-3 border-y"
                dir="rtl"
              >
                {d.ayat.map((dt) => (
                  <span
                    key={dt.id}
                    className="text-primary font-lpmq inline"
                    style={{
                      fontWeight: opts.font_weight,
                      fontSize: font_size_opts?.fontSize || "1.5rem",
                      lineHeight: font_size_opts?.lineHeight || "3.5rem",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {dt.arab}
                    <span className="text-4xl inline-flex mx-1 font-uthmani">
                      {toArabicNumber(Number(dt.ayah))}
                    </span>{" "}
                  </span>
                ))}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Pagination Controls */}
      <div className="ml-auto flex items-center justify-center gap-3 py-3 text-sm border-b">
        <Link
          className={cn(buttonVariants({ size: "icon", variant: "outline" }))}
          to={parseInt(id) === 1 ? "#" : `/muslim/quran-v2/${parseInt(id) - 1}`}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft />
        </Link>

        <span className="text-accent-foreground mt-2 sm:mt-0">
          Halaman <strong>{id}</strong> dari <strong>604</strong>
        </span>
        <Link
          className={cn(buttonVariants({ size: "icon", variant: "outline" }))}
          to={
            parseInt(id) === 604 ? "#" : `/muslim/quran-v2/${parseInt(id) + 1}`
          }
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight />
        </Link>
      </div>
    </div>
  );
}

const toArabicNumber = (number: number) => {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return number
    .toString()
    .split("")
    .map((digit) => arabicDigits[parseInt(digit)])
    .join("");
};
