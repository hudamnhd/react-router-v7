import * as ReactAria from 'react-aria-components'

import { cn } from "#app/utils/misc.tsx";

export const GridList = <T extends object>({
  className,
  ...props
}: ReactAria.GridListProps<T>) => {
  return (
    <ReactAria.GridList
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

export const GridListItem = (props: ReactAria.GridListItemProps) => {
  return <ReactAria.GridListItem {...props} />
}
