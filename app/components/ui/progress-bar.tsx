import * as React from 'react'

import * as ReactAria from 'react-aria-components'

import { cn } from "#app/utils/misc.tsx";

export const ProgressBar = ({
  className,
  ...props
}: ReactAria.ProgressBarProps) => {
  return (
    <ReactAria.ProgressBar className={cn('w-full', className)} {...props} />
  )
}

export const ProgressBarTrack = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'h-2 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-700',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface ProgressBarFilledTrackProps
  extends React.HTMLAttributes<HTMLDivElement> {
  percentage?: number
}

export const ProgressBarFilledTrack = ({
  className,
  percentage = 0,
  ...props
}: ProgressBarFilledTrackProps) => {
  return (
    <div
      className={cn('h-full bg-black dark:bg-white', className)}
      style={{ width: percentage + '%' }}
      {...props}
    />
  )
}
