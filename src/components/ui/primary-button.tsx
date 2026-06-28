import * as React from "react"
import { Button } from "./button"
import { cn } from "../../lib/utils"
import type { LucideIcon } from "lucide-react"

export interface PrimaryButtonProps extends React.ComponentProps<typeof Button> {
  icon?: LucideIcon;
}

export const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, children, icon: Icon, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn("w-full sm:w-auto", className)}
        {...props}
      >
        {Icon && <Icon className="h-4 w-4 mr-2 shrink-0" />}
        {children}
      </Button>
    )
  }
)
PrimaryButton.displayName = "PrimaryButton"
