import * as React from "react";

import { cn } from "#app/utils/misc.tsx";
import { Button } from "./button";
import { FieldError, FieldGroup, Label } from "./field";

import { Minus, Plus, ChevronDown, ChevronUp } from "lucide-react";

import {
  ButtonProps as AriaButtonProps,
  Button as AriaButton,
  Group,
  Input as AriaInput,
  InputProps as AriaInputProps,
  NumberField as AriaNumberField,
  NumberFieldProps as AriaNumberFieldProps,
  ValidationResult as AriaValidationResult,
  composeRenderProps,
  Text,
} from "react-aria-components";

const NumberField = AriaNumberField;

function NumberFieldInput({ className, ...props }: AriaInputProps) {
  return (
    <AriaInput
      className={composeRenderProps(className, (className) =>
        cn(
          "w-fit min-w-0 flex-1 border-r border-transparent bg-background pr-2 outline outline-0 placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden",
          className,
        ),
      )}
      {...props}
    />
  );
}

function NumberFieldSteppers({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "absolute right-0 flex h-full flex-col border-l",
        className,
      )}
      {...props}
    >
      <NumberFieldStepper slot="increment">
        <ChevronUp aria-hidden className="size-4" />
      </NumberFieldStepper>
      <div className="border-b" />
      <NumberFieldStepper slot="decrement">
        <ChevronDown aria-hidden className="size-4" />
      </NumberFieldStepper>
    </div>
  );
}

function NumberFieldStepper({ className, ...props }: AriaButtonProps) {
  return (
    <Button
      className={composeRenderProps(className, (className) =>
        cn("w-auto grow rounded-none px-0.5 text-muted-foreground", className),
      )}
      variant={"ghost"}
      size={"icon"}
      {...props}
    />
  );
}

interface JollyNumberFieldProps extends AriaNumberFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
}

interface JollyNumberFieldV2Props extends AriaNumberFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
}

function JollyNumberField({
  label,
  description,
  errorMessage,
  className,
  ...props
}: JollyNumberFieldProps) {
  return (
    <NumberField
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      <Label>{label}</Label>
      <FieldGroup>
        <NumberFieldInput />
        <NumberFieldSteppers />
      </FieldGroup>
      {description && (
        <Text className="text-sm text-muted-foreground" slot="description">
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
    </NumberField>
  );
}

function JollyNumberFieldV2({
  label,
  description,
  errorMessage,
  className,
  ...props
}: JollyNumberFieldV2Props) {
  return (
    <NumberField {...props}>
      <div className="spacey-0.5">
        <Label>{label}</Label>
        <Group className="relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-lg border border-input text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-ring data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/20">
          <AriaButton
            slot="decrement"
            className="-ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-lg border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minus size={16} strokeWidth={2} aria-hidden="true" />
          </AriaButton>
          <AriaInput className="w-full grow bg-background  py-2 text-center tabular-nums text-foreground focus:outline-none" />
          <AriaButton
            slot="increment"
            className="-me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-lg border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
          </AriaButton>
        </Group>
      </div>
      {description && (
        <Text className="text-sm text-muted-foreground" slot="description">
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
    </NumberField>
  );
}

export {
  NumberField,
  NumberFieldInput,
  NumberFieldSteppers,
  NumberFieldStepper,
  JollyNumberField,
  JollyNumberFieldV2,
};

export type { JollyNumberFieldProps };
