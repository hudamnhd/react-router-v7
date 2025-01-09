"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogProps as AriaDialogProps,
  DialogTrigger as AriaDialogTrigger,
  Heading as AriaHeading,
  HeadingProps as AriaHeadingProps,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  ModalOverlayProps as AriaModalOverlayProps,
  composeRenderProps,
} from "react-aria-components";

import { cn } from "#app/utils/misc.tsx";

const Dialog = AriaDialog;

const sheetVariants = cva(
  [
    "fixed z-50 gap-4 bg-background shadow-lg transition ease-in-out",
    /* Entering */
    "data-[entering]:duration-500 data-[entering]:animate-in",
    /* Exiting */
    "data-[exiting]:duration-300  data-[exiting]:animate-out",
  ],
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[entering]:slide-in-from-top data-[exiting]:slide-out-to-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[entering]:slide-in-from-bottom data-[exiting]:slide-out-to-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[entering]:slide-in-from-left data-[exiting]:slide-out-to-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[entering]:slide-in-from-right data-[exiting]:slide-out-to-right sm:max-w-sm",
      },
    },
  },
);

const DialogTrigger = AriaDialogTrigger;

const DialogOverlay = ({
  className,
  isDismissable = true,
  ...props
}: AriaModalOverlayProps) => (
  <AriaModalOverlay
    isDismissable={isDismissable}
    className={composeRenderProps(className, (className) =>
      cn(
        "fixed inset-0 z-50 bg-black/80",
        /* Exiting */
        "data-[exiting]:duration-300 data-[exiting]:animate-out data-[exiting]:fade-out-0",
        /* Entering */
        "data-[entering]:animate-in data-[entering]:fade-in-0",
        className,
      ),
    )}
    {...props}
  />
);

interface DialogContentProps
  extends Omit<React.ComponentProps<typeof AriaModal>, "children">,
    VariantProps<typeof sheetVariants> {
  children?: AriaDialogProps["children"];
  role?: AriaDialogProps["role"];
  closeButton?: boolean;
}

const baseDialog = cn(
  "fixed bottom-0 sm:bottom-auto sm:top-[50%] sm:left-[50%] ",
  "sm:translate-x-[-50%] sm:translate-y-[-50%] w-full sm:max-w-lg sm:w-full ",
  "z-50 ",
  "border p-5 ",
  "bg-background shadow-lg ",
  "sm:rounded-lg ",
  "duration-300 data-[exiting]:duration-300 ",
  "data-[entering]:animate-in data-[exiting]:animate-out ",
  "sm:data-[entering]:fade-in-0 sm:data-[exiting]:fade-out-0 ",
  "sm:data-[entering]:zoom-in-95 sm:data-[exiting]:zoom-out-95 ",
  "sm:data-[entering]:slide-in-from-left-1/2 sm:data-[entering]:slide-in-from-top-[48%] ",
  "data-[entering]:slide-in-from-bottom data-[exiting]:slide-out-to-bottom ",
  "sm:data-[exiting]:slide-out-to-left-1/2 sm:data-[exiting]:slide-out-to-top-[48%] ",
);

const DialogContent = ({
  className,
  children,
  side,
  role,
  closeButton = true,
  ...props
}: DialogContentProps) => (
  <AriaModal
    className={composeRenderProps(className, (className) =>
      cn(
        side ? sheetVariants({ side, className: "h-full p-6" }) : baseDialog,
        className,
      ),
    )}
    {...props}
  >
    <AriaDialog
      role={role}
      className={cn(!side && "grid h-full gap-2", "h-full outline-none")}
    >
      {composeRenderProps(children, (children, renderProps) => (
        <>
          {children}
          {closeButton && (
            <AriaButton
              onPress={renderProps.close}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[disabled]:pointer-events-none data-[entering]:bg-accent data-[entering]:text-muted-foreground data-[hovered]:opacity-100 data-[focused]:outline-none data-[focused]:ring-2 data-[focused]:ring-ring data-[focused]:ring-offset-2"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </AriaButton>
          )}
        </>
      ))}
    </AriaDialog>
  </AriaModal>
);

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4",
      className,
    )}
    {...props}
  />
);

const DialogTitle = ({ className, ...props }: AriaHeadingProps) => (
  <AriaHeading
    slot="title"
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
);

const DialogDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left text-sm text-muted-foreground",
      className,
    )}
    {...props}
  />
);

export {
  Dialog,
  DialogOverlay,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
};
export type { DialogContentProps };
