"use client";

import { ChevronsUpDown } from "lucide-react";
import {
  Cell as AriaCell,
  Column as AriaColumn,
  ColumnProps as AriaColumnProps,
  ResizableTableContainer as AriaResizableTableContainer,
  Row as AriaRow,
  Table as AriaTable,
  TableBody as AriaTableBody,
  TableHeader as AriaTableHeader,
  CellProps,
  ColumnResizer,
  composeRenderProps,
  Group,
  ResizableTableContainerProps,
  RowProps,
  TableBodyProps,
  TableHeaderProps,
  TableProps,
} from "react-aria-components";

import { cn } from "#app/utils/misc.tsx";
import { type ButtonProps } from "./button";
import { Input, type InputProps } from "./input";

export const ComboBox = <T extends object>({
  className,
  ...props
}: ReactAria.ComboBoxProps<T>) => {
  return (
    <ReactAria.ComboBox className={cn("group w-full", className)} {...props} />
  );
};

export const ComboBoxInput = (props: InputProps) => {
  return <Input {...props} />;
};

export interface ComboBoxContentProps<T>
  extends Omit<ReactAria.PopoverProps, "children" | "style" | "className">,
    Omit<ReactAria.ListBoxProps<T>, "style"> {
  popoverClassName?: string;
}

export const ComboBoxContent = <T extends object>({
  className,
  popoverClassName,
  ...props
}: ComboBoxContentProps<T>) => {
  return (
    <ReactAria.Popover
      className={cn(
        "min-w-[--trigger-width] overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-md dark:border-slate-700 dark:bg-slate-800",
        popoverClassName,
      )}
      {...props}
    >
      <ReactAria.ListBox className={cn("outline-none", className)} {...props} />
    </ReactAria.Popover>
  );
};

export interface ListBoxItemProps extends ReactAria.ListBoxItemProps {
  textValue: string;
}

export const ComboBoxItem = ({
  className,
  children,
  ...props
}: ListBoxItemProps) => {
  return (
    <ReactAria.ListBoxItem
      className={cn(
        "group",
        "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-black outline-none transition-colors dark:text-white",
        // Focus
        "focus:bg-slate-100 dark:focus:bg-slate-700",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent",
        className,
      )}
      {...props}
    >
      <>
        <Check
          aria-hidden="true"
          strokeWidth="3"
          className="invisible h-4 w-4 group-selected:visible"
        />
        {children}
      </>
    </ReactAria.ListBoxItem>
  );
};

export const ComboBoxButton = ({ className, ...props }: ButtonProps) => {
  return <ReactAria.Button className={cn(className)} {...props} />;
};
const ResizableTableContainer = AriaResizableTableContainer;

const Table = ({ className, ...props }: TableProps) => (
  <AriaTable
    className={composeRenderProps(className, (className) =>
      cn(
        "w-full caption-bottom text-sm -outline-offset-2   data-[focus-visible]:outline-ring",
        className,
      ),
    )}
    {...props}
  />
);

const TableHeader = <T extends object>({
  className,
  ...props
}: TableHeaderProps<T>) => (
  <AriaTableHeader
    className={composeRenderProps(className, (className) =>
      cn("[&_tr]:border-b", className),
    )}
    {...props}
  />
);

export interface ColumnProps extends AriaColumnProps {
  isResizable?: boolean;
}

const Column = ({ className, children, ...props }: ColumnProps) => (
  <AriaColumn
    className={composeRenderProps(className, (className) =>
      cn(
        "h-10 text-left align-middle font-medium text-muted-foreground -outline-offset-2 data-[focus-visible]:outline-ring ",
        className,
      ),
    )}
    {...props}
  >
    {composeRenderProps(children, (children, { allowsSorting }) => (
      <div className="flex items-center">
        <Group
          role="presentation"
          tabIndex={-1}
          className={cn(
            "flex h-9 flex-1 items-center gap-1 overflow-hidden rounded-md px-2",
            allowsSorting &&
              "p-2 data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
            "focus-visible:outline-none  data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-ring [&:has([slot=selection])]:pr-0 [&>[slot=selection]]:translate-y-[2px]",
          )}
        >
          <span className="truncate">{children}</span>
          {allowsSorting && <ChevronsUpDown className="ml-2 size-4" />}
        </Group>
        {props.isResizable && (
          <ColumnResizer className="data-[focus-visible]:ring-rin box-content h-5 w-px translate-x-[8px] cursor-col-resize rounded bg-muted-foreground bg-clip-content px-[8px]  py-1 focus-visible:outline-none data-[resizing]:w-[2px] data-[resizing]:bg-primary data-[resizing]:pl-[7px] data-[focus-visible]:ring-1  data-[focus-visible]:ring-ring" />
        )}
      </div>
    ))}
  </AriaColumn>
);

const TableBody = <T extends object>({
  className,
  ...props
}: TableBodyProps<T>) => (
  <AriaTableBody
    className={composeRenderProps(className, (className) =>
      cn("[&_tr:last-child]:border-0", className),
    )}
    {...props}
  />
);

const Row = <T extends object>({ className, ...props }: RowProps<T>) => (
  <AriaRow
    className={composeRenderProps(className, (className) =>
      cn(
        "border-b -outline-offset-2 transition-colors data-[hovered]:bg-muted/50 data-[selected]:bg-muted  data-[focus-visible]:outline-ring",
        className,
      ),
    )}
    {...props}
  />
);

const Cell = ({ className, ...props }: CellProps) => (
  <AriaCell
    className={composeRenderProps(className, (className) =>
      cn(
        "p-2 align-middle -outline-offset-2   data-[focus-visible]:outline-ring [&:has([slot=selection])]:pr-0 [&>[slot=selection]]:translate-y-[2px]",
        className,
      ),
    )}
    {...props}
  />
);

export {
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  ResizableTableContainer,
};
