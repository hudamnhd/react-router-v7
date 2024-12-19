import {
  Links,
  Meta,
  useLoaderData,
  Outlet,
  Scripts,
  data,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import React from "react";

import appStylesHref from "./app.css?url";
import type { Route } from "./+types/root";
import { getTheme, setTheme } from "~/lib/theme.server";

export function meta() {
  return [
    { title: "React Router App" },
    { name: "description", content: "Example React Router App v7!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const theme = formData.get("theme");

  const responseInit = {
    headers: { "set-cookie": setTheme(theme) },
  };
  return data({ theme }, responseInit);
}

export async function loader({ request }) {
  const theme = await getTheme(request);
  return theme;
}

export const links = () => [{ rel: "stylesheet", href: appStylesHref }];

export default function App() {
  return <Outlet />;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useLoaderData();

  return (
    <html className={`${theme} h-full overflow-x-hidden transition-colors`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
// The top most error boundary for the app, rendered when your app throws an error
// For more information, see https://reactrouter.com/start/framework/route-module#errorboundary
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main id="error-page">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
