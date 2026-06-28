import * as React from "react"
import { Button } from "../ui/button"
import { useAuth } from "../../hooks/useAuth"
import { cn } from "../../lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

export interface PermissionButtonProps extends React.ComponentProps<typeof Button> {
  action: string
  tooltip?: string
}

export const PermissionButton = React.forwardRef<HTMLButtonElement, PermissionButtonProps>(
  ({ action, className, children, variant, size, tooltip, ...props }, ref) => {
    const { hasPermission } = useAuth()
    const isAllowed = hasPermission(action)

    const restrictedClassName = cn(
      !isAllowed && "border border-red-500 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-500/50 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 ring-0 outline-none",
      className
    )

    const button = (
      <Button
        ref={ref}
        variant={!isAllowed ? "outline" : variant}
        size={size}
        className={restrictedClassName}
        {...props}
      >
        {children}
      </Button>
    )

    let displayTooltip: React.ReactNode | undefined = tooltip;

    if (!isAllowed && tooltip) {
      displayTooltip = (
        <div className="flex flex-col items-center gap-2 text-center">
          <span>{tooltip}</span>
          <span>Permission Required</span>
        </div>
      );
    } else if (isAllowed && size !== "icon") {
      displayTooltip = undefined;
    }

    if (displayTooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            {displayTooltip}
          </TooltipContent>
        </Tooltip>
      )
    }

    return button
  }
)
PermissionButton.displayName = "PermissionButton"
