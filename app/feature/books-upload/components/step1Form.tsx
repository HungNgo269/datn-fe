import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ImagePlus, BookOpen, Link2, FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePreview } from "./ImagePreview";
import { generateSlug } from "../../books/helper";
import {
    Step1CreateSchema,
    Step1EditSchema,
    Step1FormData,
} from "../schema/uploadBookSchema";
import { UploadBookButton } from "./uploadBookButton";

interface Step1FormProps {
    onNext: (data: Step1FormData) => void;
    onCancel: () => void;
    defaultValues?: Step1FormData;
    isEdit?: boolean;
}

export function Step1Form({
    onNext,
    onCancel,
    defaultValues,
    isEdit = false,
}: Step1FormProps) {
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const schema = isEdit ? Step1EditSchema : Step1CreateSchema;

    const form = useForm<Step1FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: {
            title: defaultValues?.title || "",
            slug: defaultValues?.slug || "",
            file: defaultValues?.file,
            cover: defaultValues?.cover,
        },
    });
    const watchedFile = useWatch({
        control: form.control,
        name: "file",
    });

    // Initialize cover preview from default values
    useEffect(() => {
        const cover = defaultValues?.cover;
        
        // Cleanup previous blob URL if exists
        if (coverPreview && coverPreview.startsWith("blob:")) {
            URL.revokeObjectURL(coverPreview);
        }
        
        if (cover instanceof File) {
            const url = URL.createObjectURL(cover);
            setCoverPreview(url);
            return () => URL.revokeObjectURL(url);
        } else if (typeof cover === "string") {
            setCoverPreview(cover);
        } else {
            setCoverPreview(null);
        }
    }, [defaultValues?.cover]);

    const handleFileChange = useCallback(
        (file: File) => {
            form.setValue("file", file, { shouldValidate: true });
            if (!isEdit && !form.getValues("title")) {
                const fileName = file.name.replace(/\.[^/.]+$/, "");
                form.setValue("title", fileName);
                form.setValue("slug", generateSlug(fileName));
            }
        },
        [form, isEdit]
    );

    const handleCoverChange = useCallback(
        (file: File) => {
            form.setValue("cover", file, { shouldValidate: true });
            // Use blob URL instead of data URL to prevent 431 error
            // Data URLs are too long when encoded in Next.js Image query params
            const blobUrl = URL.createObjectURL(file);
            setCoverPreview(blobUrl);
        },
        [form]
    );

    const removeCover = useCallback(() => {
        // Cleanup blob URL if exists
        if (coverPreview && coverPreview.startsWith("blob:")) {
            URL.revokeObjectURL(coverPreview);
        }
        form.setValue("cover", undefined);
        setCoverPreview(null);
    }, [form, coverPreview]);

    const fileLabel = useMemo(() => {
        const file = watchedFile;
        if (file instanceof File) return file.name;
        if (typeof file === "string" && file.length > 0) return "File sách";
        return undefined;
    }, [watchedFile]);

    return (
        <form
            onSubmit={form.handleSubmit(onNext)}
            className="flex h-full flex-col"
        >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="order-2 space-y-5 md:order-1">
                    {/* File Upload Area */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <FileUp className="h-4 w-4 text-slate-400" />
                            File sách <span className="text-rose-500">*</span>
                        </Label>
                        <div 
                            onClick={() => document.getElementById('book-file-input')?.click()}
                            className="group relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 transition-all hover:border-primary/50 hover:bg-primary/5"
                        >
                            {watchedFile ? (
                                <>
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <BookOpen className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-foreground">
                                                {watchedFile instanceof File ? watchedFile.name : "File sách"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">Nhấn để thay đổi</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-3 transition-transform group-hover:scale-110">
                                        <FileUp className="h-6 w-6 text-primary/60" />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-sm font-medium text-slate-600">Nhấn để chọn file sách</span>
                                        <p className="text-xs text-slate-400 mt-1">Chỉ file EPUB, PDF</p>
                                    </div>
                                </div>
                            )}
                            <input
                                id="book-file-input"
                                type="file"
                                accept=".pdf,.epub,.mobi"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileChange(file);
                                }}
                                className="hidden"
                            />
                        </div>
                        {form.formState.errors.file && (
                            <p className="text-sm text-rose-500 flex items-center gap-1">
                                <X className="h-3 w-3" />
                                {form.formState.errors.file.message as string}
                            </p>
                        )}
                    </div>

                    {/* Title Field */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-slate-400" />
                            Tên sách <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            {...form.register("title")}
                            placeholder="Ví dụ: Đắc nhân tâm"
                            className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary ${form.formState.errors.title ? "border-rose-300 bg-rose-50/50" : ""}`}
                            onChange={(e) => {
                                form.setValue("title", e.target.value);
                                if (e.target.value && !isEdit) {
                                    form.setValue(
                                        "slug",
                                        generateSlug(e.target.value)
                                    );
                                }
                            }}
                        />
                        {form.formState.errors.title && (
                            <p className="text-sm text-rose-500 flex items-center gap-1">
                                <X className="h-3 w-3" />
                                {form.formState.errors.title.message}
                            </p>
                        )}
                    </div>

                    {/* Slug Field */}
                    <div className="space-y-2">
                        <Label htmlFor="slug" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Link2 className="h-4 w-4 text-slate-400" />
                            Slug
                        </Label>
                        <Input
                            id="slug"
                            className="h-11 rounded-xl border-slate-200 bg-slate-100/50 text-slate-500"
                            {...form.register("slug")}
                            readOnly
                            disabled
                        />
                        {form.formState.errors.slug && (
                            <p className="text-sm text-rose-500 flex items-center gap-1">
                                <X className="h-3 w-3" />
                                {form.formState.errors.slug.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Cover Preview */}
                <div className="order-1 flex flex-col md:order-2 md:border-l md:border-slate-100 md:pl-8">
                    <Label className="mb-3 text-sm font-medium text-slate-700 flex items-center gap-2">
                        <ImagePlus className="h-4 w-4 text-slate-400" />
                        Xem trước bìa
                    </Label>
                    <div className="group relative flex min-h-[200px] flex-1 flex-col items-center justify-start rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 transition-all hover:border-primary/50 hover:bg-primary/5">
                        {coverPreview ? (
                            <>
                                <ImagePreview
                                    src={coverPreview}
                                    alt="Cover preview"
                                    onRemove={removeCover}
                                />
                                {/* Replace cover button */}
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('cover-input')?.click()}
                                    className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary/90 hover:scale-110"
                                >
                                    <ImagePlus className="h-5 w-5" />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col items-center justify-center space-y-3 p-4 text-center cursor-pointer" onClick={() => document.getElementById('cover-input')?.click()}>
                                    <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-4 transition-transform group-hover:scale-110">
                                        <ImagePlus className="h-8 w-8 text-primary/60" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-slate-600">Nhấn để chọn ảnh bìa</span>
                                        <p className="text-xs text-slate-400 mt-1">PNG, JPG tối đa 5MB</p>
                                    </div>
                                </div>
                            </>
                        )}
                        {/* Hidden file input */}
                        <input
                            id="cover-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleCoverChange(file);
                            }}
                            className="hidden"
                        />
                    </div>
                    {form.formState.errors.cover && (
                        <p className="mt-2 text-sm text-rose-500 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {form.formState.errors.cover.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 z-10 mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancel}
                    className="h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 transition-colors"
                >
                    <X className="h-4 w-4 mr-2" />
                    Hủy
                </Button>
                <Button 
                    type="submit"
                    className="h-11 px-5 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all shadow-md shadow-primary/20"
                >
                    Tiếp theo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </form>
    );
}

