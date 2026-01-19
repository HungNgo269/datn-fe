"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  ChevronLeft,
  CreditCard,
  Crown,
  DollarSign,
  FileText,
  FileUp,
  Gift,
  ImagePlus,
  Loader2,
  Lock,
  Save,
  Sparkles,
  Tag,
  Users,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import "react-quill-new/dist/quill.snow.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AsyncCreatableSelect,
  Option,
} from "@/components/ui/AsyncCreatableSelect";
import { ImagePreview } from "./ImagePreview";
import { generateSlug } from "../../books/helper";
import {
  BookCreateSchema,
  BookEditSchema,
  BookFormData,
  BookFormState,
} from "../schema/uploadBookSchema";
import { getAuthorsSearch } from "@/app/feature/author/api/authors.api";
import { getCategorySearch } from "@/app/feature/categories/api/categories.api";
import { useAuthorSubmit } from "../../author/hooks/useAuthorSubmit";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[200px] w-full animate-pulse items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
      Đang tải trình soạn thảo...
    </div>
  ),
});

interface BookFormProps {
  initialData?: BookFormState;
  onSubmit: (data: BookFormState) => void;
  isSubmitting: boolean;
  isEdit?: boolean;
  onCancel: () => void;
  initialAuthorOptions?: Option[];
  initialCategoryOptions?: Option[];
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

export function BookForm({
  initialData,
  onSubmit,
  isSubmitting,
  isEdit = false,
  onCancel,
  initialAuthorOptions = [],
  initialCategoryOptions = [],
}: BookFormProps) {
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const { submitAuthor } = useAuthorSubmit();

  // Initialize options for AsyncCreatableSelect if in edit mode
  const [defaultAuthorOptions, setDefaultAuthorOptions] = useState<Option[]>([]);
  const [defaultCategoryOptions, setDefaultCategoryOptions] = useState<Option[]>([]);

  const defaultValues: BookFormData = useMemo(
    () => ({
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      file: initialData?.file,
      cover: initialData?.cover,
      accessType: initialData?.accessType || "FREE",
      authorIds: initialData?.authorIds || [],
      categoryIds: initialData?.categoryIds || [],
      description: initialData?.description || "",
      price: initialData?.price || 0,
      freeChapters: initialData?.freeChapters || 0,
    }),
    [initialData]
  );

  const form = useForm<BookFormData>({
    resolver: zodResolver(isEdit ? BookEditSchema : BookCreateSchema),
    defaultValues,
    mode: "onChange",
  });

  // Watch for changes that affect other fields
  const accessType = useWatch({ control: form.control, name: "accessType" });
  const watchedFile = useWatch({ control: form.control, name: "file" });

  // Load initial options for select components
  useEffect(() => {
    // This is a bit of a hack since we don't have the full author/category objects passed in,
    // only IDs. In a real app we might want to pass options or fetch them.
    // However, given the current setup, we might rely on the parent to pass options
    // OR we assume that AsyncCreatableSelect can handle IDs if we provide initial options.
    // For now, let's assume the parent might need to pass options if we want to show labels correctly on load.
    // BUT looking at previous code, `Step2Form` received `authorOptions` prop.
    // I should add `authorOptions` and `categoryOptions` props or fetch them.
    // Since `EditBookPage` fetched them, I should pass them down.
    // Refactoring props to include options.
  }, []);

  // Initialize cover preview
  useEffect(() => {
    const cover = defaultValues.cover;
    if (cover instanceof File) {
      const url = URL.createObjectURL(cover);
      setCoverPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof cover === "string" && cover) {
      setCoverPreview(cover);
    } else if (initialData?.currentCoverKey) {
        // If we have a key but no direct URL string in 'cover', we might show placeholder or fetch.
        // But usually 'cover' field holds the string URL if existing.
    }
  }, [defaultValues.cover, initialData]);

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
      const blobUrl = URL.createObjectURL(file);
      setCoverPreview(blobUrl);
    },
    [form]
  );

  const removeCover = useCallback(() => {
    if (coverPreview && coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }
    form.setValue("cover", undefined);
    setCoverPreview(null);
  }, [form, coverPreview]);

  // Handle Price/FreeChapter logic
  useEffect(() => {
    if (accessType === "FREE" || accessType === "MEMBERSHIP") {
      form.setValue("price", 0);
    } else if (accessType === "PURCHASE") {
       const currentPrice = form.getValues("price");
       if (currentPrice === 0) {
           // We might want to clear it or just let validation handle it
       }
    }
    if (accessType === "FREE") {
      form.setValue("freeChapters", 0);
    }
  }, [accessType, form]);

  const handleCreateAuthor = useCallback(
    async (inputValue: string): Promise<Option> => {
      try {
        const newAuthor = await submitAuthor({ name: inputValue }, "create");
        if (!newAuthor || !newAuthor.data?.id) throw new Error("Failed to create author");
        return { value: newAuthor.data.id, label: newAuthor.data.name || inputValue };
      } catch (error) {
        toast.error("Lỗi khi tạo tác giả mới");
        throw error;
      }
    },
    [submitAuthor]
  );

  const fetchAuthorOptions = useCallback(async (query: string): Promise<Option[]> => {
    try {
      const response = await getAuthorsSearch({ page: 1, limit: 20, q: query });
      return (response.data || []).map((a) => ({ value: a.id, label: a.name }));
    } catch {
      return [];
    }
  }, []);

  const fetchCategoryOptions = useCallback(async (query: string): Promise<Option[]> => {
    try {
      const response = await getCategorySearch({ page: 1, limit: 20, q: query });
      return (response.data || []).map((c) => ({ value: c.id, label: c.name }));
    } catch {
      return [];
    }
  }, []);
  
  // Need to handle passing initial options or fetching them for display
  // For simplicty, I will accept them as props, updated interface below.

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-8">
          
          {/* Basic Info Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Thông tin cơ bản</h3>
            
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* File Upload - Prominent */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-700">File sách <span className="text-rose-500">*</span></Label>
                        <div 
                            onClick={() => document.getElementById('book-file-input')?.click()}
                            className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-slate-100 transition-colors flex items-center gap-3 h-[52px]"
                        >
                             <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                 <FileUp className="w-4 h-4 text-blue-600" />
                             </div>
                             <div className="overflow-hidden flex-1">
                                 <p className="text-sm font-medium truncate">
                                     {watchedFile instanceof File ? watchedFile.name : (watchedFile as string || "Chọn file .epub, .pdf")}
                                 </p>
                             </div>
                             {watchedFile instanceof File && (
                                <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{(watchedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                             )}
                             <input id="book-file-input" type="file" accept=".pdf,.epub" onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} className="hidden" />
                        </div>
                        {form.formState.errors.file && <p className="text-sm text-rose-500">{form.formState.errors.file.message as string}</p>}
                    </div>

                   {/* Title */}
                   <div className="space-y-3">
                    <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                      Tên sách <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      placeholder="Ví dụ: Đắc nhân tâm"
                       className={`h-[52px] rounded-xl focus:ring-primary/20 focus:border-primary ${form.formState.errors.title ? "border-rose-300 bg-rose-50/50" : ""}`}
                      onChange={(e) => {
                        form.setValue("title", e.target.value);
                        if (!isEdit) form.setValue("slug", generateSlug(e.target.value));
                      }}
                    />
                    {form.formState.errors.title && (
                        <p className="text-sm text-rose-500 flex items-center gap-1">{form.formState.errors.title.message}</p>
                    )}
                  </div>
               </div>

               {/* Slug */}
              <div className="space-y-3">
                <Label htmlFor="slug" className="text-sm font-medium text-slate-700">Slug (URL)</Label>
                <Input
                  id="slug"
                  {...form.register("slug")}
                  className="bg-slate-50 text-slate-500 border-none shadow-none font-mono"
                  readOnly
                />
              </div>

               {/* Description */}
               <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">Mô tả</Label>
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
                        className="rounded-xl border border-slate-200 [&_.ql-editor]:min-h-[200px] [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-b-slate-100 [&_.ql-container]:rounded-b-xl [&_.ql-container]:border-none"
                        placeholder="Nhập mô tả sách chi tiết..."
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column - Classification & Access */}
            <div className="lg:col-span-8 space-y-10">
                
                {/* Classification Section */}
                <section className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Phân loại</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-slate-700">Tác giả <span className="text-rose-500">*</span></Label>
                            <Controller
                                control={form.control}
                                name="authorIds"
                                render={({ field }) => (
                                <AsyncCreatableSelect
                                    label="tác giả"
                                    placeholder="Tìm hoặc thêm..."
                                    value={field.value}
                                    onChange={field.onChange}
                                    fetchOptions={fetchAuthorOptions}
                                    onCreateOption={handleCreateAuthor}
                                    valueOptions={initialAuthorOptions}
                                    displayMode="inline"
                                />
                                )}
                            />
                             {form.formState.errors.authorIds && (
                                <p className="text-sm text-rose-500">{form.formState.errors.authorIds.message}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-slate-700">Thể loại <span className="text-rose-500">*</span></Label>
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
                                    valueOptions={initialCategoryOptions}
                                    displayMode="inline"
                                />
                                )}
                            />
                             {form.formState.errors.categoryIds && (
                                <p className="text-sm text-rose-500">{form.formState.errors.categoryIds.message}</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Access Settings Section */}
                <section className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Truy cập & Giá</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="space-y-3">
                            <Label className="text-sm font-medium text-slate-700">Loại truy cập <span className="text-rose-500">*</span></Label>
                            <Controller
                                control={form.control}
                                name="accessType"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="h-[46px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FREE"><div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500"/> Miễn phí</div></SelectItem>
                                            <SelectItem value="MEMBERSHIP"><div className="flex items-center gap-2"><Crown className="w-4 h-4 text-amber-500"/> Hội viên</div></SelectItem>
                                            <SelectItem value="PURCHASE"><div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-500"/> Trả phí</div></SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                         </div>

                        {accessType === "PURCHASE" && (
                             <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-sm font-medium text-slate-700">Giá (VND) <span className="text-rose-500">*</span></Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input 
                                        type="number" 
                                        {...form.register("price", { valueAsNumber: true })} 
                                        className="pl-9 h-[46px]" 
                                        placeholder="0"
                                    />
                                </div>
                                {form.formState.errors.price && <p className="text-sm text-rose-500">{form.formState.errors.price.message}</p>}
                             </div>
                        )}

                        {accessType !== "FREE" && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-sm font-medium text-slate-700">Số chương miễn phí</Label>
                                <div className="relative">
                                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input 
                                        type="number" 
                                        {...form.register("freeChapters", { valueAsNumber: true })} 
                                        className="pl-9 h-[46px]" 
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Right Column - Media */}
            <div className="lg:col-span-4 space-y-10">
                <section className="space-y-6">
                     <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Ảnh bìa</h3>
                    
                    <div className="space-y-3">
                         <div 
                            onClick={() => document.getElementById('cover-input')?.click()}
                            className="group relative w-full aspect-[2/3] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all hover:border-primary/50 overflow-hidden cursor-pointer"
                         >
                            {coverPreview ? (
                                <div className="w-full h-full">
                                    <ImagePreview src={coverPreview} alt="Cover" onRemove={(e) => { e.stopPropagation(); removeCover(); }} />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); document.getElementById('cover-input')?.click(); }}
                                        className="absolute bottom-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white text-slate-700 shadow-xl border hover:scale-110 transition-transform z-10 opacity-0 group-hover:opacity-100"
                                    >
                                        <ImagePlus className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center p-6 text-center">
                                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                         <ImagePlus className="w-8 h-8 text-primary" />
                                    </div>
                                    <span className="text-lg font-medium text-slate-700">Chọn ảnh bìa</span>
                                    <span className="text-sm text-slate-400 mt-2 max-w-[200px]">Kéo thả hoặc click để<br/>upload (PNG, JPG)</span>
                                </div>
                            )}
                            <input id="cover-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleCoverChange(e.target.files[0])} className="hidden" />
                         </div>
                         {form.formState.errors.cover && <p className="text-sm text-rose-500">{form.formState.errors.cover.message as string}</p>}
                    </div>
                </section>
            </div>
          </div>

        </div>
      </div>

       {/* Floating Action Bar */}
      <div className="sticky bottom-6 z-50 mx-auto max-w-fit">
          <div className="bg-white/90 backdrop-blur-sm border shadow-lg rounded-full px-6 py-3 flex items-center gap-3">
               <Button variant="ghost" type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-full">
                   Hủy
               </Button>
               <Button type="submit" disabled={isSubmitting} className="rounded-full bg-primary hover:bg-primary/90 px-8">
                   {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                   {isEdit ? "Lưu thay đổi" : "Tạo sách mới"}
               </Button>
          </div>
      </div>
    </form>
  );
}
