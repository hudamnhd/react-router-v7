import { Link } from "@remix-run/react";
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
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Application Information</CardTitle>
        <CardDescription>Information details</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="sm:divide-y sm:divide-border">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Developer
            </dt>
            <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
              Huda
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3">
            <dt className="text-sm font-medium text-muted-foreground">Name</dt>
            <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
              Doti App
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Description
            </dt>
            <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
              Simple application for everyday
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Source Api Quran
            </dt>
            <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
              <ul className="list-disc list-inside">
                <li>
                  <Link to="https://api.myquran.com/v2/quran">
                    https://api.myquran.com/v2/quran
                  </Link>
                </li>
                <li>
                  <Link to="https://api.myquran.com/v2/doa">
                    https://api.myquran.com/v2/doa
                  </Link>
                </li>
                <li>
                  <Link to="https://gist.github.com/autotrof/172eb06313bebaefbc88ec1b04da4fef">
                    https://gist.github.com/autotrof/172eb06313bebaefbc88ec1b04da4fef
                  </Link>
                </li>
              </ul>
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Font Quran Kemenag (LPMQ)
            </dt>
            <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
              <Link to="https://lajnah.kemenag.go.id/unduhan.html">
                https://lajnah.kemenag.go.id/unduhan.html
              </Link>
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3">
            <dt className="text-sm font-medium text-muted-foreground">Stack</dt>
            <dd className="flex items-center flex-wrap mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
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
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Dependencies
            </dt>

            <dd className="flex items-center flex-wrap mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
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
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Deploy
            </dt>
            <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
              <Link to="https://vercel.com/">Vercel</Link>
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Components
            </dt>
            <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
              <Link to="/components">Demo</Link>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
