import { DisplaySetting } from "#app/routes/resources+/prefs";
import { Link } from "@remix-run/react";
import { cn } from "#app/utils/misc.tsx";
import { buttonVariants } from "#app/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { type MetaFunction } from "@remix-run/node";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#app/components/ui/card";
export const meta: MetaFunction = () => [{ title: "About | Doti App" }];

export default function Index() {
  return (
    <div className="prose-base dark:prose-invert w-full max-w-xl mx-auto border-x">
      <div className="px-1.5 pt-2.5 pb-2 flex justify-between gap-x-3 sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center gap-x-2">
          <Link
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
              "prose-none [&_svg]:size-6 bg-transparent",
            )}
            to="/"
          >
            <ChevronLeft />
          </Link>
          <span className="text-lg font-semibold capitalize">About</span>
        </div>

        <DisplaySetting />
      </div>

      <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] capitalize py-3">
        About
      </div>
      <dl className="divide-y border-t -mt-1">
        <div className="px-4 pb-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Developer
          </dt>
          <dd className="mt-1 text-sm text-foreground">Huda</dd>
        </div>
        <div className="px-4 pb-3">
          <dt className="text-sm font-medium text-muted-foreground">Name</dt>
          <dd className="mt-1 text-sm text-foreground">Doti App</dd>
        </div>
        <div className="px-4 pb-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Description
          </dt>
          <dd className="mt-1 text-sm text-foreground">
            Simple application for everyday
          </dd>
        </div>
        <div className="px-4 pb-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Source Api Quran
          </dt>
          <dd className="text-sm text-foreground">
            <ul className="list-disc list-inside">
              <li className="break-all">
                <Link to="https://api.myquran.com/v2/quran">
                  https://api.myquran.com/v2/quran
                </Link>
              </li>
              <li className="break-all">
                <Link to="https://api.myquran.com/v2/doa">
                  https://api.myquran.com/v2/doa
                </Link>
              </li>
              <li className="break-all">
                <Link to="https://gist.github.com/autotrof/172eb06313bebaefbc88ec1b04da4fef">
                  https://gist.github.com/autotrof/172eb06313bebaefbc88ec1b04da4fef
                </Link>
              </li>
            </ul>
          </dd>
        </div>
        <div className="px-4 pb-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Font Quran Kemenag (LPMQ)
          </dt>
          <dd className="mt-1 text-sm text-foreground">
            <Link to="https://lajnah.kemenag.go.id/unduhan.html">
              https://lajnah.kemenag.go.id/unduhan.html
            </Link>
          </dd>
        </div>
        <div className="px-4 pb-3">
          <dt className="text-sm font-medium text-muted-foreground">Stack</dt>
          <dd className="text-sm text-foreground">
            <ul className="list-disc list-inside">
              <li>
                <Link to="https://react.dev/">React</Link>
              </li>
              <li>
                <Link to="https://remix.run">Remix</Link>
              </li>
              <li>
                <Link to="https://github.com/epicweb-dev/epic-stack">
                  Epic Stack
                </Link>
              </li>
              <li>
                <Link to="https://vite.dev/">React</Link>
              </li>
            </ul>
          </dd>
        </div>
        <div className="px-4 pb-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Dependencies
          </dt>

          <dd className="text-sm text-foreground">
            <ul className="list-disc list-inside">
              <li>
                <Link to="https://tailwindcss.com/">Tailwind CSS</Link>
              </li>
              <li>
                <Link to="https://www.radix-ui.com/primitives">Radix UI</Link>
              </li>
              <li>
                <Link to="https://ui.shadcn.com/">Shadcn UI</Link>
              </li>
              <li>
                <Link to="https://react-spectrum.adobe.com/react-aria/index.html">
                  React Aria Components
                </Link>
              </li>
              <li>
                <Link to="https://tanstack.com/virtual/latest">
                  Tanstack Virtual
                </Link>
              </li>
              <li>
                <Link to="https://github.com/sindresorhus/ky">Ky</Link>
              </li>
              <li>
                <Link to="https://lucide.dev/">Lucide React</Link>
              </li>
              <li>
                <Link to="https://www.fusejs.io/">Fuse.js</Link>
              </li>
              <li>
                <Link to="https://redux.js.org/">Redux.js</Link>
              </li>
            </ul>
          </dd>
        </div>
        <div className="px-4 pb-3">
          <dt className="text-sm font-medium text-muted-foreground">Deploy</dt>
          <dd className="mt-1 text-sm">
            <Link to="https://vercel.com/">Vercel</Link>
          </dd>
        </div>
        <div className="px-4 pb-3">
          <dt className="text-sm font-medium text-muted-foreground">
            Components
          </dt>
          <dd className="mt-1 text-sm">
            <Link to="/components">Demo</Link>
          </dd>
        </div>
      </dl>
    </div>
  );
}
