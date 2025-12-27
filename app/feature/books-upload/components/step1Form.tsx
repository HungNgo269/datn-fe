import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePreview } from "./ImagePreview";
import { generateSlug } from "../../books/helper";
import { useEffect, useState } from "react";
import {
    Step1FormData,
    Step1CreateSchema,
    Step1EditSchema,
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
        defaultValues: {
            title: defaultValues?.title || "",
            slug: defaultValues?.slug || "",
            file: defaultValues?.file,
            cover: defaultValues?.cover,
        },
    });

    useEffect(() => {
        form.reset({
            title: defaultValues?.title || "",
            slug: defaultValues?.slug || "",
            file: defaultValues?.file,
            cover: defaultValues?.cover,
        });
    }, [defaultValues, form]);

    useEffect(() => {
        const cover = defaultValues?.cover;
        if (cover) {
            if (typeof cover === "string") {
                setCoverPreview(cover);
            } else if (cover instanceof File) {
                const reader = new FileReader();
                reader.onloadend = () =>
                    setCoverPreview(reader.result as string);
                reader.readAsDataURL(cover);
            }
        } else {
            setCoverPreview(null);
        }
    }, [defaultValues]);

    const handleFileChange = (file: File) => {
        form.setValue("file", file, { shouldValidate: true });
        if (!isEdit && !form.getValues("title")) {
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            form.setValue("title", fileName);
            form.setValue("slug", generateSlug(fileName));
        }
    };

    const handleCoverChange = (file: File) => {
        form.setValue("cover", file, { shouldValidate: true });
        const reader = new FileReader();
        reader.onloadend = () => setCoverPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const removeCover = () => {
        form.setValue("cover", undefined);
        setCoverPreview(null);
    };

    const getFileLabel = () => {
        const file = form.watch("file");
        if (file instanceof File) return file.name;
        if (typeof file === "string" && file.length > 0)
            return "File sách hiện tại (Đã upload)";
        return undefined;
    };

    return (
        <form
            onSubmit={form.handleSubmit(onNext)}
            className="h-full flex flex-col"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5 order-2 md:order-1">
                    <UploadBookButton
                        label="File Sách"
                        accept=".pdf,.epub,.mobi"
                        buttonText={getFileLabel() || "Chọn file EPUB/PDF"}
                        required={!isEdit}
                        onChange={handleFileChange}
                        selectedFile={
                            form.watch("file") instanceof File
                                ? form.watch("file")
                                : undefined
                        }
                        error={form.formState.errors.file?.message as string}
                    />

                    <div className="space-y-2">
                        <Label htmlFor="title">Tên Sách</Label>
                        <Input
                            id="title"
                            {...form.register("title")}
                            placeholder="Ví dụ: Đắc Nhân Tâm"
                            onChange={(e) => {
                                form.setValue("title", e.target.value);
                                if (e.target.value) {
                                    if (!isEdit)
                                        form.setValue(
                                            "slug",
                                            generateSlug(e.target.value)
                                        );
                                }
                            }}
                        />
                        {form.formState.errors.title && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.title.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            className="bg-muted text-muted-foreground"
                            {...form.register("slug")}
                            readOnly
                            disabled
                        />
                        {form.formState.errors.slug && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.slug.message}
                            </p>
                        )}
                    </div>

                    <div className="pt-2">
                        <UploadBookButton
                            label="Ảnh Bìa"
                            accept="image/*"
                            buttonText="Chọn ảnh bìa"
                            onChange={handleCoverChange}
                        />
                        {form.formState.errors.cover && (
                            <p className="text-sm text-destructive mt-1">
                                {form.formState.errors.cover.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="order-1 md:order-2 flex flex-col md:border-l md:pl-8 border-border">
                    <Label className="mb-3 block">Xem Trước Bìa</Label>
                    <div className="flex-1 flex flex-col items-center justify-start min-h-[200px] bg-muted/30 rounded-lg border border-border border-dashed p-4">
                        {coverPreview ? (
                            <ImagePreview
                                src={coverPreview}
                                alt="Cover preview"
                                onRemove={removeCover}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm text-center">
                                Chưa có ảnh bìa
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border sticky bottom-0 bg-background/95 backdrop-blur z-10">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Hủy
                </Button>
                <Button type="submit">
                    Tiếp theo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </form>
    );
}
