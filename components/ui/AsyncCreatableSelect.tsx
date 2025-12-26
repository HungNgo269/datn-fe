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
  onCreateOption?: (label: string) => Promise<Option>; // Hàm này phải trả về Promise<Option> có value là ID (number)
  placeholder?: string;
  label?: string;
  className?: string;
}

// Helper highlight text matches (Hint cho Elastic Search)
const HighlightText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim()) return <span>{text}</span>;

  // Escape regex characters
  const escapeRegExp = (string: string) =>
    string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapeRegExp(highlight)})`, "gi"));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span
            key={i}
            className="bg-yellow-200 text-black font-semibold rounded-[2px] px-[1px]"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

export function AsyncCreatableSelect({
  value = [],
  onChange,
  fetchOptions,
  onCreateOption,
  placeholder = "Tìm kiếm...",
  label = "mục",
  className,
}: AsyncCreatableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [options, setOptions] = React.useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Load options khi search
  React.useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      if (!open) return;
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
  }, [debouncedQuery, open, fetchOptions]);

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
      // Kiểm tra xem option đã có trong selectedOptions chưa để tránh duplicate object
      const existing = selectedOptions.find((o) => o.value === option.value);
      newSelectedOptions = existing
        ? selectedOptions
        : [...selectedOptions, option];
    }

    setSelectedOptions(newSelectedOptions);
    onChange(newValues);
  };

  const handleCreate = async () => {
    if (!query || !onCreateOption) return;
    setCreating(true);
    try {
      // Gọi API tạo mới, API trả về Option có value là ID số
      const newOption = await onCreateOption(query);

      // Update state
      setSelectedOptions((prev) => [...prev, newOption]);
      onChange([...value, newOption.value]);

      // Reset UI
      setQuery("");
      setOpen(false); // Đóng popover sau khi tạo xong
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
          <div className="flex flex-wrap gap-1 justify-start items-center w-full">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((opt) => (
                <Badge
                  variant="secondary"
                  key={opt.value}
                  className="mr-1 pr-1 flex items-center gap-1"
                >
                  {opt.label}
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
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          {/* shouldFilter={false} là quan trọng để Elastic Search backend tự lo liệu việc filter */}
          <CommandInput
            placeholder={`Tìm ${label}...`}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && (
              <div className="p-4 flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tìm
                kiếm...
              </div>
            )}

            {!loading && options.length === 0 && query && (
              <CommandEmpty className="py-2 px-4 text-sm">
                <p className="text-muted-foreground mb-2">
                  Không tìm thấy {query}
                </p>
                {onCreateOption && (
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
                    Tạo mới {query}
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
                    value={String(option.value)} // Command yêu cầu value string
                    onSelect={() => handleSelect(option)}
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
        </Command>
      </PopoverContent>
    </Popover>
  );
}
