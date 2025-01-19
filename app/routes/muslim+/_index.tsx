import { DisplaySetting } from "#app/routes/resources+/prefs";
import { cn } from "#app/utils/misc.tsx";
import { buttonVariants } from "#app/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { muslimLinks } from "#app/constants/nav-link";
import { useNavigate, Link } from "@remix-run/react";

export function headers() {
  return {
    "Cache-Control": "public, max-age=31560000, immutable",
  };
}

export default function Example() {
  const data = muslimLinks;
  const navigate = useNavigate();

  return (
    <div className="border-x min-h-[calc(100vh)] max-w-xl mx-auto pb-2">
      <div className="px-1.5 pt-2.5 pb-2 flex justify-between gap-x-3 border-b sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center gap-x-2">
          <Link
            title="Kembali"
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
              "prose-none [&_svg]:size-6",
            )}
            to="/"
          >
            <ChevronLeft />
          </Link>
          <span className="text-lg font-semibold">Muslim</span>
        </div>

        <DisplaySetting themeSwitchOnly={true} />
      </div>
      <div className="text-center pt-3">
        <div className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
          Muslim
        </div>
        <p className="text-muted-foreground mt-1">
          Here's a list of apps ready to use!
        </p>
      </div>

      <ul role="list" className="grid grid-cols-1 gap-2 p-2.5 sm:p-3">
        {data.map((action, actionIdx) => (
          <li
            onClick={() => navigate(action.href)}
            key={actionIdx}
            className="col-span-1 flex shadow-sm rounded-md hover:bg-accent cursor-pointer"
          >
            <div className="flex-shrink-0 flex items-center justify-center w-16 text-sm font-medium rounded-l-md bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20">
              <action.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex-1 flex items-center justify-between border-t border-r border-b  rounded-r-md truncate">
              <div className="flex-1 px-4 py-2 text-sm truncate">
                <div className="font-semibold hover:text-muted-foreground cursor-pointer">
                  {action.title}
                </div>
                <p className="text-muted-foreground line-clamp-1">
                  {action.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Test = () => {
  return (
    <>
      <div>
        <div className="relative bg-sky-700 pb-32 overflow-hidden">
          {/* Menu open: "bg-sky-900", Menu closed: "bg-transparent" */}
          <nav className="bg-transparent relative z-10 border-b border-teal-500 border-opacity-25 lg:bg-transparent lg:border-none">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
              <div className="relative h-16 flex items-center justify-between lg:border-b lg:border-sky-800">
                <div className="px-2 flex items-center lg:px-0">
                  <div className="flex-shrink-0">
                    <img
                      className="block h-8 w-auto"
                      src="https://tailwindui.com/img/logos/workflow-mark-teal-400.svg"
                      alt="Workflow"
                    />
                  </div>
                  <div className="hidden lg:block lg:ml-6 lg:space-x-4">
                    <div className="flex">
                      {/* Current: "bg-black bg-opacity-25", Default: "hover:bg-sky-800" */}
                      <a
                        href="#"
                        className="bg-black bg-opacity-25 rounded-md py-2 px-3 text-sm font-medium text-white"
                      >
                        Dashboard
                      </a>
                      <a
                        href="#"
                        className="hover:bg-sky-800 rounded-md py-2 px-3 text-sm font-medium text-white"
                      >
                        Jobs
                      </a>
                      <a
                        href="#"
                        className="hover:bg-sky-800 rounded-md py-2 px-3 text-sm font-medium text-white"
                      >
                        Applicants
                      </a>
                      <a
                        href="#"
                        className="hover:bg-sky-800 rounded-md py-2 px-3 text-sm font-medium text-white"
                      >
                        Company
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex-1 px-2 flex justify-center lg:ml-6 lg:justify-end">
                  <div className="max-w-lg w-full lg:max-w-xs">
                    <label htmlFor="search" className="sr-only">
                      Search
                    </label>
                    <div className="relative text-sky-100 focus-within:text-gray-400">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                        {/* Heroicon name: solid/search */}
                        <svg
                          className="flex-shrink-0 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <input
                        id="search"
                        name="search"
                        className="block w-full bg-sky-700 bg-opacity-50 py-2 pl-10 pr-3 border border-transparent rounded-md leading-5 placeholder-sky-100 focus:outline-none focus:bg-white focus:ring-white focus:border-white focus:placeholder-gray-500 focus:text-gray-900 sm:text-sm"
                        placeholder="Search"
                        type="search"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex lg:hidden">
                  {/* Mobile menu button */}
                  <button
                    type="button"
                    className="p-2 rounded-md inline-flex items-center justify-center text-sky-200 hover:text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    aria-controls="mobile-menu"
                    aria-expanded="false"
                  >
                    <span className="sr-only">Open main menu</span>
                    {/*
          Icon when menu is closed.

          Heroicon name: outline/menu

          Menu open: "hidden", Menu closed: "block"
        */}
                    <svg
                      className="block flex-shrink-0 h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    {/*
          Icon when menu is open.

          Heroicon name: outline/x

          Menu open: "block", Menu closed: "hidden"
        */}
                    <svg
                      className="hidden flex-shrink-0 h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="hidden lg:block lg:ml-4">
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="flex-shrink-0 rounded-full p-1 text-sky-200 hover:bg-sky-800 hover:text-white focus:outline-none focus:bg-sky-900 focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-900 focus:ring-white"
                    >
                      <span className="sr-only">View notifications</span>
                      {/* Heroicon name: outline/bell */}
                      <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </button>
                    {/* Profile dropdown */}
                    <div className="relative flex-shrink-0 ml-4">
                      <div>
                        <button
                          type="button"
                          className="rounded-full flex text-sm text-white focus:outline-none focus:bg-sky-900 focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-900 focus:ring-white"
                          id="user-menu-button"
                          aria-expanded="false"
                          aria-haspopup="true"
                        >
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="rounded-full h-8 w-8"
                            src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=320&h=320&q=80"
                            alt=""
                          />
                        </button>
                      </div>
                      {/*
            Dropdown menu, show/hide based on menu state.

            Entering: "transition ease-out duration-100"
              From: "transform opacity-0 scale-95"
              To: "transform opacity-100 scale-100"
            Leaving: "transition ease-in duration-75"
              From: "transform opacity-100 scale-100"
              To: "transform opacity-0 scale-95"
          */}
                      <div
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu-button"
                        tabIndex={-1}
                      >
                        {/* Active: "bg-gray-100", Not Active: "" */}
                        <a
                          href="#"
                          className="block py-2 px-4 text-sm text-gray-700"
                          role="menuitem"
                          tabIndex={-1}
                          id="user-menu-item-0"
                        >
                          Your Profile
                        </a>
                        <a
                          href="#"
                          className="block py-2 px-4 text-sm text-gray-700"
                          role="menuitem"
                          tabIndex={-1}
                          id="user-menu-item-1"
                        >
                          Settings
                        </a>
                        <a
                          href="#"
                          className="block py-2 px-4 text-sm text-gray-700"
                          role="menuitem"
                          tabIndex={-1}
                          id="user-menu-item-2"
                        >
                          Sign out
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Mobile menu, show/hide based on menu state. */}
            <div className="bg-sky-900 lg:hidden" id="mobile-menu">
              <div className="pt-2 pb-3 px-2 space-y-1">
                {/* Current: "bg-black bg-opacity-25", Default: "hover:bg-sky-800" */}
                <a
                  href="#"
                  className="bg-black bg-opacity-25 block rounded-md py-2 px-3 text-base font-medium text-white"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="hover:bg-sky-800 block rounded-md py-2 px-3 text-base font-medium text-white"
                >
                  Jobs
                </a>
                <a
                  href="#"
                  className="hover:bg-sky-800 block rounded-md py-2 px-3 text-base font-medium text-white"
                >
                  Applicants
                </a>
                <a
                  href="#"
                  className="hover:bg-sky-800 block rounded-md py-2 px-3 text-base font-medium text-white"
                >
                  Company
                </a>
              </div>
              <div className="pt-4 pb-3 border-t border-sky-800">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <img
                      className="rounded-full h-10 w-10"
                      src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=320&h=320&q=80"
                      alt=""
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">
                      Debbie Lewis
                    </div>
                    <div className="text-sm font-medium text-sky-200">
                      debbielewis@example.com
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-auto flex-shrink-0 rounded-full p-1 text-sky-200 hover:bg-sky-800 hover:text-white focus:outline-none focus:bg-sky-900 focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-900 focus:ring-white"
                  >
                    <span className="sr-only">View notifications</span>
                    {/* Heroicon name: outline/bell */}
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 px-2">
                  <a
                    href="#"
                    className="block rounded-md py-2 px-3 text-base font-medium text-sky-200 hover:text-white hover:bg-sky-800"
                  >
                    Your Profile
                  </a>
                  <a
                    href="#"
                    className="block rounded-md py-2 px-3 text-base font-medium text-sky-200 hover:text-white hover:bg-sky-800"
                  >
                    Settings
                  </a>
                  <a
                    href="#"
                    className="block rounded-md py-2 px-3 text-base font-medium text-sky-200 hover:text-white hover:bg-sky-800"
                  >
                    Sign out
                  </a>
                </div>
              </div>
            </div>
          </nav>
          {/* Menu open: "bottom-0", Menu closed: "inset-y-0" */}
          <div
            aria-hidden="true"
            className="inset-y-0 absolute inset-x-0 left-1/2 transform -translate-x-1/2 w-full overflow-hidden lg:inset-y-0"
          >
            <div className="absolute inset-0 flex">
              <div
                className="h-full w-1/2"
                style={{ backgroundColor: "#0a527b" }}
              />
              <div
                className="h-full w-1/2"
                style={{ backgroundColor: "#065d8c" }}
              />
            </div>
            <div className="relative flex justify-center">
              <svg
                className="flex-shrink-0"
                width={1750}
                height={308}
                viewBox="0 0 1750 308"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M284.161 308H1465.84L875.001 182.413 284.161 308z"
                  fill="#0369a1"
                />
                <path
                  d="M1465.84 308L16.816 0H1750v308h-284.16z"
                  fill="#065d8c"
                />
                <path d="M1733.19 0L284.161 308H0V0h1733.19z" fill="#0a527b" />
                <path
                  d="M875.001 182.413L1733.19 0H16.816l858.185 182.413z"
                  fill="#0a4f76"
                />
              </svg>
            </div>
          </div>
          <header className="relative py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-white">Settings</h1>
            </div>
          </header>
        </div>
        <main className="relative -mt-32">
          <div className="max-w-screen-xl mx-auto pb-6 px-4 sm:px-6 lg:pb-16 lg:px-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
                <aside className="py-6 lg:col-span-3">
                  <nav className="space-y-1">
                    {/* Current: "bg-teal-50 border-teal-500 text-teal-700 hover:bg-teal-50 hover:text-teal-700", Default: "border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900" */}
                    <a
                      href="#"
                      className="bg-teal-50 border-teal-500 text-teal-700 hover:bg-teal-50 hover:text-teal-700 group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
                      aria-current="page"
                    >
                      {/*
            Heroicon name: outline/user-circle

            Current: "text-teal-500 group-hover:text-teal-500", Default: "text-gray-400 group-hover:text-gray-500"
          */}
                      <svg
                        className="text-teal-500 group-hover:text-teal-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="truncate"> Profile </span>
                    </a>
                    <a
                      href="#"
                      className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
                    >
                      {/* Heroicon name: outline/cog */}
                      <svg
                        className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="truncate"> Account </span>
                    </a>
                    <a
                      href="#"
                      className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
                    >
                      {/* Heroicon name: outline/key */}
                      <svg
                        className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                      <span className="truncate"> Password </span>
                    </a>
                    <a
                      href="#"
                      className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
                    >
                      {/* Heroicon name: outline/bell */}
                      <svg
                        className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      <span className="truncate"> Notifications </span>
                    </a>
                    <a
                      href="#"
                      className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
                    >
                      {/* Heroicon name: outline/credit-card */}
                      <svg
                        className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span className="truncate"> Billing </span>
                    </a>
                    <a
                      href="#"
                      className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
                    >
                      {/* Heroicon name: outline/view-grid-add */}
                      <svg
                        className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="truncate"> Integrations </span>
                    </a>
                  </nav>
                </aside>
                <form
                  className="divide-y divide-gray-200 lg:col-span-9"
                  action="#"
                  method="POST"
                >
                  {/* Profile section */}
                  <div className="py-6 px-4 sm:p-6 lg:pb-8">
                    <div>
                      <h2 className="text-lg leading-6 font-medium text-gray-900">
                        Profile
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        This information will be displayed publicly so be
                        careful what you share.
                      </p>
                    </div>
                    <div className="mt-6 flex flex-col lg:flex-row">
                      <div className="flex-grow space-y-6">
                        <div>
                          <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700"
                          >
                            {" "}
                            Username{" "}
                          </label>
                          <div className="mt-1 rounded-md shadow-sm flex">
                            <span className="bg-gray-50 border border-r-0 border-gray-300 rounded-l-md px-3 inline-flex items-center text-gray-500 sm:text-sm">
                              {" "}
                              workcation.com/{" "}
                            </span>
                            <input
                              type="text"
                              name="username"
                              id="username"
                              autoComplete="username"
                              className="focus:ring-sky-500 focus:border-sky-500 flex-grow block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                              defaultValue="deblewis"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="about"
                            className="block text-sm font-medium text-gray-700"
                          >
                            {" "}
                            About{" "}
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="about"
                              name="about"
                              rows={3}
                              className="shadow-sm focus:ring-sky-500 focus:border-sky-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                              defaultValue={""}
                            />
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Brief description for your profile. URLs are
                            hyperlinked.
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 flex-grow lg:mt-0 lg:ml-6 lg:flex-grow-0 lg:flex-shrink-0">
                        <p
                          className="text-sm font-medium text-gray-700"
                          aria-hidden="true"
                        >
                          Photo
                        </p>
                        <div className="mt-1 lg:hidden">
                          <div className="flex items-center">
                            <div
                              className="flex-shrink-0 inline-block rounded-full overflow-hidden h-12 w-12"
                              aria-hidden="true"
                            >
                              <img
                                className="rounded-full h-full w-full"
                                src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=320&h=320&q=80"
                                alt=""
                              />
                            </div>
                            <div className="ml-5 rounded-md shadow-sm">
                              <div className="group relative border border-gray-300 rounded-md py-2 px-3 flex items-center justify-center hover:bg-gray-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500">
                                <label
                                  htmlFor="mobile-user-photo"
                                  className="relative text-sm leading-4 font-medium text-gray-700 pointer-events-none"
                                >
                                  <span>Change</span>
                                  <span className="sr-only"> user photo</span>
                                </label>
                                <input
                                  id="mobile-user-photo"
                                  name="user-photo"
                                  type="file"
                                  className="absolute w-full h-full opacity-0 cursor-pointer border-gray-300 rounded-md"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="hidden relative rounded-full overflow-hidden lg:block">
                          <img
                            className="relative rounded-full w-40 h-40"
                            src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=320&h=320&q=80"
                            alt=""
                          />
                          <label
                            htmlFor="desktop-user-photo"
                            className="absolute inset-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center text-sm font-medium text-white opacity-0 hover:opacity-100 focus-within:opacity-100"
                          >
                            <span>Change</span>
                            <span className="sr-only"> user photo</span>
                            <input
                              type="file"
                              id="desktop-user-photo"
                              name="user-photo"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-gray-300 rounded-md"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-12 gap-6">
                      <div className="col-span-12 sm:col-span-6">
                        <label
                          htmlFor="first-name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          First name
                        </label>
                        <input
                          type="text"
                          name="first-name"
                          id="first-name"
                          autoComplete="given-name"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-6">
                        <label
                          htmlFor="last-name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Last name
                        </label>
                        <input
                          type="text"
                          name="last-name"
                          id="last-name"
                          autoComplete="family-name"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        />
                      </div>
                      <div className="col-span-12">
                        <label
                          htmlFor="url"
                          className="block text-sm font-medium text-gray-700"
                        >
                          URL
                        </label>
                        <input
                          type="text"
                          name="url"
                          id="url"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-6">
                        <label
                          htmlFor="company"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          id="company"
                          autoComplete="organization"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Privacy section */}
                  <div className="pt-6 divide-y divide-gray-200">
                    <div className="px-4 sm:px-6">
                      <div>
                        <h2 className="text-lg leading-6 font-medium text-gray-900">
                          Privacy
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Ornare eu a volutpat eget vulputate. Fringilla commodo
                          amet.
                        </p>
                      </div>
                      <ul role="list" className="mt-2 divide-y divide-gray-200">
                        <li className="py-4 flex items-center justify-between">
                          <div className="flex flex-col">
                            <p
                              className="text-sm font-medium text-gray-900"
                              id="privacy-option-1-label"
                            >
                              Available to hire
                            </p>
                            <p
                              className="text-sm text-gray-500"
                              id="privacy-option-1-description"
                            >
                              Nulla amet tempus sit accumsan. Aliquet turpis sed
                              sit lacinia.
                            </p>
                          </div>
                          {/* Enabled: "bg-teal-500", Not Enabled: "bg-gray-200" */}
                          <button
                            type="button"
                            className="bg-gray-200 ml-4 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                            role="switch"
                            aria-checked="true"
                            aria-labelledby="privacy-option-1-label"
                            aria-describedby="privacy-option-1-description"
                          >
                            {/* Enabled: "translate-x-5", Not Enabled: "translate-x-0" */}
                            <span
                              aria-hidden="true"
                              className="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
                            />
                          </button>
                        </li>
                        <li className="py-4 flex items-center justify-between">
                          <div className="flex flex-col">
                            <p
                              className="text-sm font-medium text-gray-900"
                              id="privacy-option-2-label"
                            >
                              Make account private
                            </p>
                            <p
                              className="text-sm text-gray-500"
                              id="privacy-option-2-description"
                            >
                              Pharetra morbi dui mi mattis tellus sollicitudin
                              cursus pharetra.
                            </p>
                          </div>
                          {/* Enabled: "bg-teal-500", Not Enabled: "bg-gray-200" */}
                          <button
                            type="button"
                            className="bg-gray-200 ml-4 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                            role="switch"
                            aria-checked="false"
                            aria-labelledby="privacy-option-2-label"
                            aria-describedby="privacy-option-2-description"
                          >
                            {/* Enabled: "translate-x-5", Not Enabled: "translate-x-0" */}
                            <span
                              aria-hidden="true"
                              className="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
                            />
                          </button>
                        </li>
                        <li className="py-4 flex items-center justify-between">
                          <div className="flex flex-col">
                            <p
                              className="text-sm font-medium text-gray-900"
                              id="privacy-option-3-label"
                            >
                              Allow commenting
                            </p>
                            <p
                              className="text-sm text-gray-500"
                              id="privacy-option-3-description"
                            >
                              Integer amet, nunc hendrerit adipiscing nam.
                              Elementum ame
                            </p>
                          </div>
                          {/* Enabled: "bg-teal-500", Not Enabled: "bg-gray-200" */}
                          <button
                            type="button"
                            className="bg-gray-200 ml-4 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                            role="switch"
                            aria-checked="true"
                            aria-labelledby="privacy-option-3-label"
                            aria-describedby="privacy-option-3-description"
                          >
                            {/* Enabled: "translate-x-5", Not Enabled: "translate-x-0" */}
                            <span
                              aria-hidden="true"
                              className="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
                            />
                          </button>
                        </li>
                        <li className="py-4 flex items-center justify-between">
                          <div className="flex flex-col">
                            <p
                              className="text-sm font-medium text-gray-900"
                              id="privacy-option-4-label"
                            >
                              Allow mentions
                            </p>
                            <p
                              className="text-sm text-gray-500"
                              id="privacy-option-4-description"
                            >
                              Adipiscing est venenatis enim molestie commodo eu
                              gravid
                            </p>
                          </div>
                          {/* Enabled: "bg-teal-500", Not Enabled: "bg-gray-200" */}
                          <button
                            type="button"
                            className="bg-gray-200 ml-4 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                            role="switch"
                            aria-checked="true"
                            aria-labelledby="privacy-option-4-label"
                            aria-describedby="privacy-option-4-description"
                          >
                            {/* Enabled: "translate-x-5", Not Enabled: "translate-x-0" */}
                            <span
                              aria-hidden="true"
                              className="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
                            />
                          </button>
                        </li>
                      </ul>
                    </div>
                    <div className="mt-4 py-4 px-4 flex justify-end sm:px-6">
                      <button
                        type="button"
                        className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-5 bg-sky-700 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
