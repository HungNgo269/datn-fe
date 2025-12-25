"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Step2Schema,
    Step2FormData,
    Step1FormData,
    BookFormState,
} from "../schema/uploadBookSchema";
import { MOCK_AUTHORS, MOCK_CATEGORIES } from "./constant";
import { MultiSelect } from "./multiSelect";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => (
        <div className="h-[200px] w-full bg-muted/20 animate-pulse rounded-md flex items-center justify-center text-muted-foreground text-sm">
            Đang tải trình soạn thảo...
        </div>
    ),
});

interface Step2FormProps {
    step1Data?: Step1FormData;
    defaultValues?: Step2FormData | Partial<BookFormState>;
    onBack: () => void;
    onCancel: () => void;
    onSubmit: (data: Step2FormData) => void;
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
    defaultValues,
    onBack,
    onCancel,
    onSubmit,
    isSubmitting,
}: Step2FormProps) {
    // Extract only Step2 fields from defaultValues (in case BookFormState is passed)
    const step2Defaults: Step2FormData = {
        authorIds: defaultValues?.authorIds ?? [],
        categoryIds: defaultValues?.categoryIds ?? [],
        description: defaultValues?.description ?? "",
        price: defaultValues?.price ?? 0,
        freeChapters: defaultValues?.freeChapters ?? 0,
    };

    const form = useForm<Step2FormData>({
        resolver: zodResolver(Step2Schema),
        defaultValues: step2Defaults,
    });

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {step1Data?.title && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3 text-sm text-muted-foreground mb-4">
                    <div className="bg-background p-2 rounded-full border shadow-sm">
                        <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        Đang thiết lập thông tin chi tiết cho sách:{" "}
                        <span className="font-semibold text-foreground">
                            {step1Data.title}
                        </span>
                    </div>
                </div>
            )}

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
                            disabled={isSubmitting}
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                            đ
                        </span>
                    </div>
                    {form.formState.errors.price && (
                        <p className="text-sm text-destructive font-medium">
                            {form.formState.errors.price.message}
                        </p>
                    )}
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
                        disabled={isSubmitting}
                    />
                    {form.formState.errors.freeChapters && (
                        <p className="text-sm text-destructive font-medium">
                            {form.formState.errors.freeChapters.message}
                        </p>
                    )}
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
                                value={field.value || ""} // Fallback empty string
                                onChange={field.onChange}
                                modules={quillModules}
                                readOnly={isSubmitting}
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

            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-border mt-8 sticky bottom-0 bg-background/95 backdrop-blur py-4 z-10">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="border-dashed border-muted-foreground/40 hover:border-primary/50 text-muted-foreground"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại bước 1
                </Button>

                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Hủy bỏ
                    </Button>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-w-[150px] shadow-md"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Hoàn tất & Đăng
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}
