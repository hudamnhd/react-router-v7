import React from "react";
import * as ReactAria from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#app/utils/misc.tsx";

const buttonVariants = cva(
  [
    "inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
    /* Disabled */
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ",
    /* Focus Visible */
    "data-[focus-visible]:outline-none data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring ",
    /* Resets */
    "focus-visible:outline-none",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow data-[hovered]:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm data-[hovered]:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm  data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm data-[hovered]:bg-secondary/80",
        ghost: "data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
        link: "text-primary underline-offset-4 data-[hovered]:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export interface ButtonProps
  extends ReactAria.ButtonProps,
    VariantProps<typeof buttonVariants> {
  className?: string;
}

const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return (
    <ReactAria.Button
      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        }),
      )}
      {...props}
    />
  );
};
Button.displayName = "Button";

export { Button, buttonVariants };
