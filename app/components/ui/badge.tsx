import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        neutral: [
          "bg-gray-50 text-gray-900 ring-gray-500/30",
          "dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20",
        ],
        success: [
          "bg-emerald-50 text-emerald-900 ring-emerald-600/30",
          "dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20",
        ],
        error: [
          "bg-red-50 text-red-900 ring-red-600/20",
          "dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20",
        ],
        warning: [
          "bg-yellow-50 text-yellow-900 ring-yellow-600/30",
          "dark:bg-yellow-400/10 dark:text-yellow-500 dark:ring-yellow-400/20",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
