import * as ReactAria from 'react-aria-components'

import { cn } from "#app/utils/misc.tsx";

export const TextField = ({
  className,
  ...props
}: ReactAria.TextFieldProps) => {
  return <ReactAria.TextField className={cn('w-full', className)} {...props} />
}

export const TextFieldDescription = ({
  className,
  ...props
}: ReactAria.TextProps) => {
  return (
    <ReactAria.Text
      elementType="div"
      slot="description"
      className={cn(
        'mt-2 text-sm text-slate-500 dark:text-slate-400',
        className,
      )}
      {...props}
    />
  )
}

export const TextFieldErrorMessage = ({
  className,
  ...props
}: ReactAria.TextProps) => {
  return (
    <ReactAria.Text
      elementType="div"
      slot="errorMessage"
      className={cn('mt-2 text-sm text-red-600 dark:text-red-400', className)}
      {...props}
    />
  )
}
