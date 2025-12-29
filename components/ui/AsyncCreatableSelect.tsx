"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Plus, X } from "lucide-react";
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
import { useDebounce } from "@/app/share/hook/useDebounce";

export interface Option {
  value: string | number;
  label: string;
  [key: string]: unknown;
}

interface AsyncCreatableSelectProps {
  value?: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  fetchOptions: (query: string) => Promise<Option[]>;
  onCreateOption?: (label: string) => Promise<Option>;
  placeholder?: string;
  label?: string;
  className?: string;
  displayMode?: "popover" | "inline";
}

export function AsyncCreatableSelect({
  value = [],
  onChange,
  fetchOptions,
  onCreateOption,
  placeholder = "Tìm kiếm...",
  label = "mục",
  className,
  displayMode = "popover",
}: AsyncCreatableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [options, setOptions] = React.useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const isInline = displayMode === "inline";
  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const hasExactMatch = options.some(
    (option) => option.label.trim().toLowerCase() === normalizedQuery
  );
  const canCreate = Boolean(onCreateOption && trimmedQuery && !hasExactMatch);

  React.useEffect(() => {
    let active = true;
    const shouldLoad = isInline || open;

    const loadOptions = async () => {
      if (!shouldLoad) return;
      setLoading(true);
      try {
        const results = await fetchOptions(debouncedQuery);
        if (active) setOptions(results);
      } catch (error) {
        console.error("Failed to fetch options", error);
        if (active) setOptions([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, [debouncedQuery, fetchOptions, open, isInline]);

  React.useEffect(() => {
    if (!value || value.length === 0) {
      setSelectedOptions([]);
      return;
    }

    setSelectedOptions((prev) => {
      const map = new Map<string | number, Option>();
      prev.forEach((opt) => map.set(opt.value, opt));
      options.forEach((opt) => {
        if (!map.has(opt.value)) {
          map.set(opt.value, opt);
        }
      });

      return value.map((val) => {
        if (map.has(val)) return map.get(val)!;
        return { value: val, label: String(val) };
      });
    });
  }, [value, options]);

  const handleSelect = (option: Option) => {
    const isSelected = value.some((val) => val === option.value);
    let newValues;
    let newSelectedOptions;

    if (isSelected) {
      newValues = value.filter((val) => val !== option.value);
      newSelectedOptions = selectedOptions.filter(
        (o) => o.value !== option.value
      );
    } else {
      newValues = [...value, option.value];
      const exists = selectedOptions.find((o) => o.value === option.value);
      newSelectedOptions = exists
        ? selectedOptions
        : [...selectedOptions, option];
    }

    setSelectedOptions(newSelectedOptions);
    onChange(newValues);
  };

  const handleCreate = async () => {
    if (!trimmedQuery || !onCreateOption) return;
    setCreating(true);
    try {
      const newOption = await onCreateOption(trimmedQuery);
      setSelectedOptions((prev) => [...prev, newOption]);
      onChange([...value, newOption.value]);
      setQuery("");
      if (!isInline) {
        setOpen(false);
      }
    } catch (error) {
      console.error("Failed to create option", error);
    } finally {
      setCreating(false);
    }
  };

  const handleRemove = (e: React.MouseEvent, val: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    const newValues = value.filter((v) => v !== val);
    const newSelectedOptions = selectedOptions.filter((o) => o.value !== val);
    setSelectedOptions(newSelectedOptions);
    onChange(newValues);
  };
  console.log("op[", selectedOptions);
  const renderSelectedBadges = () => (
    <div className="flex flex-wrap gap-1 justify-start items-center w-full">
      {selectedOptions.length > 0 ? (
        selectedOptions.map((opt) => (
          <Badge key={opt.value} className="mr-1 pr-1 flex items-center gap-1">
            <span className="truncate max-w-[140px]" title={opt.label}>
              {opt.label}
            </span>
            <div
              className="rounded-full p-0.5 hover:bg-destructive hover:text-white cursor-pointer transition-colors"
              onMouseDown={(e) => handleRemove(e, opt.value)}
            >
              <X size={12} />
            </div>
          </Badge>
        ))
      ) : (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
    </div>
  );

  const commandContent = (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder={`Tìm ${label}...`}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {query && options.length === 0 && (
          <CommandEmpty className="py-2 px-4 text-sm">
            <p className="text-muted-foreground mb-2">Không tìm thấy {query}</p>
            {canCreate && (
              <Button
                size="sm"
                className="w-full"
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Tạo mới {trimmedQuery}
              </Button>
            )}
          </CommandEmpty>
        )}

        <CommandGroup>
          {options.map((option) => {
            const isSelected = value.some((val) => val === option.value);
            return (
              <CommandItem
                key={option.value}
                value={String(option.value)}
                onSelect={() => handleSelect(option)}
                className="text-foreground"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    isSelected ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
      {canCreate && options.length > 0 && (
        <div className="p-2 border-t border-border">
          <Button
            size="sm"
            className="w-full"
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Tạo mới {trimmedQuery}
          </Button>
        </div>
      )}
    </Command>
  );

  if (isInline) {
    return (
      <div className={cn("space-y-2", className)}>
        {renderSelectedBadges()}
        <div className="rounded-md border bg-popover text-popover-foreground">
          {commandContent}
        </div>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-[40px] h-auto text-left font-normal",
            className
          )}
        >
          {renderSelectedBadges()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        {commandContent}
      </PopoverContent>
    </Popover>
  );
}
