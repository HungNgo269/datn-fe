"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Step1Data, Step2Data, Step2Schema } from "../schema/uploadBookSchema";
import { MOCK_AUTHORS, MOCK_CATEGORIES } from "./constant";
import { MultiSelect } from "./multiSelect";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <p className="p-4">Đang tải trình soạn thảo...</p>,
});
interface Step2FormProps {
    step1Data: Step1Data;
    onBack: () => void;
    onCancel: () => void;
    onSubmit: (data: Step2Data) => void;
    isSubmitting: boolean;
}

const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
    ],
};

export function Step2Form({
    step1Data,
    onBack,
    onCancel,
    onSubmit,
    isSubmitting,
}: Step2FormProps) {
    const form = useForm<Step2Data>({
        resolver: zodResolver(Step2Schema),
        defaultValues: {
            authorIds: [],
            categoryIds: [],
            description: "",
            price: 0,
            freeChapters: 0,
        },
    });

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="space-y-1 md:col-span-2">
                    <MultiSelect
                        name="authorIds"
                        label="Tác Giả"
                        options={MOCK_AUTHORS}
                        control={form.control}
                        error={form.formState.errors.authorIds?.message}
                        required
                    />
                </div>
                <div className="space-y-1 md:col-span-2">
                    <MultiSelect
                        name="categoryIds"
                        label="Thể Loại"
                        options={MOCK_CATEGORIES}
                        control={form.control}
                        error={form.formState.errors.categoryIds?.message}
                        required
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="price">Giá (VND)</Label>
                    <div className="relative">
                        <Input
                            id="price"
                            type="number"
                            step="1000"
                            min="0"
                            {...form.register("price", { valueAsNumber: true })}
                            placeholder="0"
                            className="pr-12"
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                            đ
                        </span>
                    </div>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="freeChapters">Số Chương Miễn Phí</Label>
                    <Input
                        id="freeChapters"
                        type="number"
                        min="0"
                        {...form.register("freeChapters", {
                            valueAsNumber: true,
                        })}
                        placeholder="0"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Mô Tả</Label>
                <Controller
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                        <div className="prose-sm">
                            <ReactQuill
                                theme="snow"
                                value={field.value}
                                onChange={field.onChange}
                                modules={quillModules}
                                className="bg-background rounded-md lg:[&_.ql-editor]:min-h-[200px]"
                                placeholder="Nhập mô tả sách chi tiết..."
                            />
                        </div>
                    )}
                />
                {form.formState.errors.description && (
                    <p className="text-sm text-destructive font-medium">
                        {form.formState.errors.description.message}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-6"></div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8 sticky bottom-0 bg-background/95 backdrop-blur">
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-w-[120px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Hoàn thành
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}
