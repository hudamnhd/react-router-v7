import { Link } from "@remix-run/react";
import React from "react";
import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Doti App" }];
};
export default function RouteX() {
  return <SuratDetail />;
}

const SuratDetail: React.FC = () => {
  return (
    <div className="xl:block hidden prose-base dark:prose-invert w-full border-x">
      <div className="mt-4 flex items-center justify-center h-[calc(100vh-75px)]">
        <div className="text-center">
          <div className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl">
            Al Qur'an Tafsir Kemenag
          </div>
          <div className="mt-4 max-w-xl mx-auto text-xl text-muted-foreground">
            Temukan ketenangan melalui ayat-ayat Al Qur'an.
          </div>

          <div className="text-muted-foreground prose-sm mt-3">
            Sumber:
            <br />
            <Link
              className="text-blue-600 dark:text-blue-400"
              to="https://github.com/rioastamal/quran-json/tree/master"
            >
              https://github.com/rioastamal/quran-json/tree/master
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
