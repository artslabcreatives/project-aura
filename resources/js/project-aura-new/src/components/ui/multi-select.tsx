import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface SearchableOption {
  value: string;
  label: string;
  group?: string;
}

interface MultiSearchableSelectProps {
  values: string[];
  onValuesChange: (values: string[]) => void;
  options: SearchableOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSearchableSelect({
  values = [],
  onValuesChange,
  options,
  placeholder = "Select...",
  className,
  disabled = false,
}: MultiSearchableSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Group options if needed
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, SearchableOption[]> = {};
    const noGroup: SearchableOption[] = [];

    options.forEach((option) => {
      if (option.group) {
        if (!groups[option.group]) {
          groups[option.group] = [];
        }
        groups[option.group].push(option);
      } else {
        noGroup.push(option);
      }
    });

    const sortedGroups = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    return { groups, sortedGroups, noGroup };
  }, [options]);

  const handleSelect = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onValuesChange(values.filter((v) => v !== optionValue));
    } else {
      onValuesChange([...values, optionValue]);
    }
  };

  const removeValue = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    onValuesChange(values.filter((v) => v !== val));
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-10", !values.length && "text-muted-foreground", className)}
        >
          <div className="flex flex-wrap gap-1">
            {values.length === 0 && placeholder}
            {values.map((val) => {
              const updateLabel = options.find((o) => o.value === val)?.label || val;
              return (
                <Badge key={val} variant="secondary" className="mr-1">
                  {updateLabel}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer opacity-50 hover:opacity-100"
                    onClick={(e) => removeValue(e, val)}
                  />
                </Badge>
              );
            })}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {groupedOptions.noGroup.length > 0 && (
              <CommandGroup>
                {groupedOptions.noGroup.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        values.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {groupedOptions.sortedGroups.map((groupName) => (
              <CommandGroup key={groupName} heading={groupName}>
                {groupedOptions.groups[groupName].map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        values.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
// End of file
