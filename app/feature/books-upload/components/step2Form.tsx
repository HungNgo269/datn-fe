"use client";

import { useForm, Controller } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

import {
    Step2Schema,
    Step2FormData,
    Step1FormData,
    BookFormState,
} from "../schema/uploadBookSchema";

import { getAuthorsSearch } from "@/app/feature/author/api/authors.api"; // Ví dụ đường dẫn
import { getCategorySearch } from "@/app/feature/categories/api/categories.api"; // Ví dụ đường dẫn
import {
    AsyncCreatableSelect,
    Option,
} from "@/components/ui/AsyncCreatableSelect";
import { useAuthorSubmit } from "../../author/hooks/useAuthorSubmit";

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
    onBack: (data: Step2FormData) => void;
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
    const step2Defaults: Step2FormData = useMemo(
        () => ({
            authorIds: defaultValues?.authorIds ?? [],
            categoryIds: defaultValues?.categoryIds ?? [],
            description: defaultValues?.description ?? "",
            price: defaultValues?.price ?? 0,
            freeChapters: defaultValues?.freeChapters ?? 0,
        }),
        [defaultValues]
    );
    const { submitAuthor } = useAuthorSubmit();

    const form = useForm<Step2FormData>({
        resolver: zodResolver(Step2Schema),
        defaultValues: step2Defaults,
    });

    useEffect(() => {
        form.reset(step2Defaults);
    }, [form, step2Defaults]);
    const handleCreateAuthor = async (inputValue: string): Promise<Option> => {
        try {
            const newAuthor = await submitAuthor(
                { name: inputValue },
                "create"
            );

            if (!newAuthor || !newAuthor.data?.id) {
                throw new Error("Không lấy được ID tác giả mới");
            }

            toast.success(`Đã tạo tác giả: ${inputValue}`);

            return {
                value: newAuthor.data?.id,
                label: newAuthor.data?.name || inputValue,
            };
        } catch (error) {
            toast.error("Lỗi khi tạo tác giả mới");
            throw error;
        }
    };

    const fetchAuthorOptions = async (query: string): Promise<Option[]> => {
        try {
            const response = await getAuthorsSearch({
                page: 1,
                limit: 20,
                q: query,
            });

            const authors = response.data || [];

            return authors.map((author) => ({
                value: author.id,
                label: author.name,
            }));
        } catch (error) {
            console.error("Lỗi search author:", error);
            return [];
        }
    };
    const fetchCategoryOptions = async (query: string): Promise<Option[]> => {
        try {
            const response = await getCategorySearch({
                page: 1,
                limit: 20,
                q: query,
            });

            const categories = response.data || [];

            return categories.map((cat) => ({
                value: cat.id,
                label: cat.name,
            }));
        } catch (error) {
            console.error("Lỗi search category:", error);
            return [];
        }
    };

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
                <div className="space-y-1 md:col-span-3">
                    <Label>
                        Tác Giả <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                        control={form.control}
                        name="authorIds"
                        render={({ field }) => (
                            <AsyncCreatableSelect
                                label="tác giả"
                                placeholder="Tìm hoặc thêm tác giả..."
                                value={field.value}
                                onChange={field.onChange}
                                fetchOptions={fetchAuthorOptions}
                                onCreateOption={handleCreateAuthor}
                                displayMode="inline"
                            />
                        )}
                    />
                    <p className="text-[0.8rem] text-muted-foreground">
                        Nhập tên để tìm kiếm. Nếu chưa có, nhấn Tạo mới.
                    </p>
                    {form.formState.errors.authorIds && (
                        <p className="text-sm text-destructive font-medium">
                            {form.formState.errors.authorIds.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1 md:col-span-3">
                    <Label>
                        Thể Loại <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                        control={form.control}
                        name="categoryIds"
                        render={({ field }) => (
                            <AsyncCreatableSelect
                                label="thể loại"
                                placeholder="Chọn thể loại..."
                                value={field.value}
                                onChange={field.onChange}
                                fetchOptions={fetchCategoryOptions}
                                displayMode="inline"
                            />
                        )}
                    />
                    {form.formState.errors.categoryIds && (
                        <p className="text-sm text-destructive font-medium">
                            {form.formState.errors.categoryIds.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1 md:col-span-3">
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

                <div className="space-y-1 md:col-span-3">
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
                                value={field.value || ""}
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

            {/* --- FOOTER BUTTONS --- */}
            <div className="flex justify-between items-center pt-6 border-t border-border mt-8 sticky bottom-0 bg-background/95 backdrop-blur py-4 z-10">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onBack(form.getValues())}
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
