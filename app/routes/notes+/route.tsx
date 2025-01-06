import { Outlet } from "@remix-run/react";
import React from "react";
import { Button } from "#app/components/ui/button-shadcn";
import { ChevronLeft, House } from "lucide-react";
import { useNavigate } from "@remix-run/react";

export default function Component() {
  const navigate = useNavigate();
  return (
    <div className="relative bg-background overflow-hidden  px-4 sm:px-6 pt-4 pb-20">
      <div className="fixed grid grid-cols-2 gap-x-2 items-center justify-center bottom-3 left-1/2 transform -translate-x-1/2  z-20">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
          Back
        </Button>
        <Button onClick={() => navigate("/")}>
          <House size={16} strokeWidth={2} aria-hidden="true" />
          Home
        </Button>
      </div>
      <div className="relative">
        <div className="mt-4 prose prose-lg dark:prose-invert text-gray-700 dark:text-gray-300 mx-auto max-w-none prose-code:font-sans">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
