import * as React from "react"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./dropdown-menu"
import { ChevronDown, Search } from "lucide-react"

export interface MultiSelectDropdownProps {
  options: { id: string; name: string; description?: string }[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  label?: string
}

export function MultiSelectDropdown({
  options,
  selectedIds,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  label,
}: MultiSelectDropdownProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selectedId => selectedId !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal text-slate-700 dark:text-slate-200">
          <span className="truncate">
            {selectedIds.length === 0
              ? placeholder
              : `${selectedIds.length} selected`}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] p-0" align="start">
        {label && (
          <>
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="max-h-[250px] overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            filteredOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.id}
                checked={selectedIds.includes(option.id)}
                onCheckedChange={() => toggleOption(option.id)}
                onSelect={(e) => e.preventDefault()}
                className="flex flex-col items-start px-3 py-2 cursor-pointer"
              >
                <div className="font-medium text-sm">{option.name}</div>
                {option.description && (
                  <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {option.description}
                  </div>
                )}
              </DropdownMenuCheckboxItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
