import { l as reactExports, j as jsxRuntimeExports, aS as Popover, aT as PopoverTrigger, B as Button, z as cn, aU as PopoverContent, bL as Command, bM as CommandInput, bZ as CommandList, bN as CommandEmpty, bO as CommandGroup, bP as CommandItem, q as Check } from "./index-C4ZP3eFM.js";
import { C as ChevronsUpDown } from "./chevrons-up-down-DISs2Pfx.js";
function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className,
  disabled = false
}) {
  const [open, setOpen] = reactExports.useState(false);
  const groupedOptions = reactExports.useMemo(() => {
    const groups = {};
    const noGroup = [];
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
  const selectedLabel = options.find((opt) => opt.value === value)?.label;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, modal: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "outline",
        role: "combobox",
        disabled,
        "aria-expanded": open,
        className: cn("w-full justify-between font-normal", !value && "text-muted-foreground", className),
        children: [
          selectedLabel || placeholder,
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-[300px] p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Command,
      {
        filter: (value2, search) => {
          if (!search) return 1;
          const v = value2.toLowerCase();
          const s = search.toLowerCase();
          if (v === s) return 1;
          if (v.startsWith(s)) return 0.9;
          if (v.includes(" " + s)) return 0.8;
          if (v.includes(s)) return 0.7;
          return 0;
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: "Search..." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "No results found." }),
            groupedOptions.noGroup.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { children: groupedOptions.noGroup.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              CommandItem,
              {
                value: option.label,
                onSelect: () => {
                  onValueChange(option.value);
                  setOpen(false);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Check,
                    {
                      className: cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )
                    }
                  ),
                  option.label
                ]
              },
              option.value
            )) }),
            groupedOptions.sortedGroups.map((groupName) => /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { heading: groupName, children: groupedOptions.groups[groupName].map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              CommandItem,
              {
                value: option.label,
                onSelect: () => {
                  onValueChange(option.value);
                  setOpen(false);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Check,
                    {
                      className: cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )
                    }
                  ),
                  option.label
                ]
              },
              option.value
            )) }, groupName))
          ] })
        ]
      }
    ) })
  ] });
}
export {
  SearchableSelect as S
};
