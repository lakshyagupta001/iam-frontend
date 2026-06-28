import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "./input"
import { cn } from "../../lib/utils"

interface PageToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  primaryAction?: React.ReactNode;
}

export function PageToolbar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  primaryAction,
  className,
  ...props
}: PageToolbarProps) {
  return (
    <div 
      className={cn(
        "flex flex-col sm:flex-row gap-4 items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800", 
        className
      )} 
      {...props}
    >
      <div className="relative flex-1 w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-9 w-full bg-white dark:bg-slate-900"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {primaryAction && (
        <div className="w-full sm:w-auto flex shrink-0">
          {primaryAction}
        </div>
      )}
    </div>
  );
}
