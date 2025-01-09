import * as ReactAria from "react-aria-components";

import { cn } from "#app/utils/misc.tsx";

export const Label = ({ className, ...props }: ReactAria.LabelProps) => {
  return (
    <ReactAria.Label
      className={cn(
        "text-sm mb-1 mr-3 block font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
};
