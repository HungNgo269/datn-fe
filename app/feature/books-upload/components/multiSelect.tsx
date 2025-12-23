import * as React from "react";
import {
    Control,
    Controller,
    FieldValues,
    Path,
    useWatch,
} from "react-hook-form";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils"; // Hàm merge class mặc định của shadcn
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
import { Label } from "@/components/ui/label";

interface Option {
    id: number;
    name: string;
}

interface MultiSelectProps<T extends FieldValues> {
    name: Path<T>;
    label: string;
    options: Option[];
    control: Control<T>;
    error?: string;
    required?: boolean;
}

export function MultiSelect<T extends FieldValues>({
    name,
    label,
    options,
    control,
    error,
    required = false,
}: MultiSelectProps<T>) {
    const [open, setOpen] = React.useState(false);

    const selectedValues = (useWatch({
        control,
        name,
    }) || []) as number[];

    const handleUnselect = (
        idToRemove: number,
        onChange: (value: number[]) => void
    ) => {
        const newValues = selectedValues.filter(
            (id: number) => id !== idToRemove
        );
        onChange(newValues);
    };

    return (
        <div className="space-y-2">
            <Label>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>

            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className={`w-full justify-between h-auto min-h-[40px] ${
                                    !selectedValues.length
                                        ? "text-muted-foreground"
                                        : ""
                                }`}
                            >
                                {selectedValues.length > 0
                                    ? `Đã chọn ${selectedValues.length} tác giả`
                                    : "Chọn tác giả..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-full p-0" align="start">
                            <Command>
                                <CommandInput
                                    placeholder={`Tìm kiếm ${label.toLowerCase()}...`}
                                />
                                <CommandList>
                                    <CommandEmpty>
                                        Không tìm thấy kết quả.
                                    </CommandEmpty>
                                    <CommandGroup className="max-h-64 overflow-auto">
                                        {options.map((option) => {
                                            const isSelected =
                                                selectedValues.includes(
                                                    option.id
                                                );
                                            return (
                                                <CommandItem
                                                    key={option.id}
                                                    value={option.name}
                                                    onSelect={() => {
                                                        const currentValues =
                                                            Array.isArray(
                                                                field.value
                                                            )
                                                                ? field.value
                                                                : [];
                                                        if (isSelected) {
                                                            field.onChange(
                                                                currentValues.filter(
                                                                    (
                                                                        id: number
                                                                    ) =>
                                                                        id !==
                                                                        option.id
                                                                )
                                                            );
                                                        } else {
                                                            field.onChange([
                                                                ...currentValues,
                                                                option.id,
                                                            ]);
                                                        }
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            isSelected
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    {option.name}
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            />

            <Controller
                name={name}
                control={control}
                render={({ field }) =>
                    selectedValues && selectedValues.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedValues.map((id: number) => {
                                const option = options.find((o) => o.id === id);
                                if (!option) return null;
                                return (
                                    <Badge
                                        key={id}
                                        variant="default"
                                        className="pl-2 pr-1"
                                    >
                                        {option.name}
                                        <div
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                            onClick={() =>
                                                handleUnselect(
                                                    id,
                                                    field.onChange
                                                )
                                            }
                                        >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </div>
                                    </Badge>
                                );
                            })}
                        </div>
                    ) : (
                        <></>
                    )
                }
            />

            {error && (
                <p className="text-sm text-red-600 font-medium">{error}</p>
            )}
        </div>
    );
}
