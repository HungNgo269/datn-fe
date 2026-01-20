"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChapterContent } from "../types/chapter.type";
import { Label } from "@/components/ui/label"; // Check if Label exists, Step 421 said label.tsx exists.

const formSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tên chương"),
  chapter_number: z.coerce.number().min(1, "Thứ tự chương phải lớn hơn 0"),
  content: z.string().min(10, "Nội dung chương phải có ít nhất 10 ký tự"),
});

type ChapterFormValues = z.infer<typeof formSchema>;

interface AdminChapterFormProps {
  initialData?: ChapterContent | null;
  onSubmit: (data: ChapterFormValues) => void;
  isSubmitting: boolean;
  bookSlug?: string; // made optional
}

export function AdminChapterForm({
  initialData,
  onSubmit,
  isSubmitting,
}: AdminChapterFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChapterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      chapter_number: initialData?.order || 1,
      content: initialData?.contentUrl || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg border shadow-sm">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Tên chương</Label>
          <Input
            id="title"
            placeholder="Nhập tên chương..."
            {...register("title")}
            className={errors.title ? "border-rose-500" : ""}
          />
          {errors.title && (
            <p className="text-sm font-medium text-rose-500">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="chapter_number">Số thứ tự chương</Label>
          <Input
            id="chapter_number"
            type="number"
            {...register("chapter_number")}
            className={errors.chapter_number ? "border-rose-500" : ""}
          />
          {errors.chapter_number && (
            <p className="text-sm font-medium text-rose-500">
              {errors.chapter_number.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Nội dung chương</Label>
        <Textarea
          id="content"
          placeholder="Nhập nội dung chương truyện..."
          className={`min-h-[400px] ${errors.content ? "border-rose-500" : ""}`}
            {...register("content")}
        />
        {errors.content && (
          <p className="text-sm font-medium text-rose-500">
            {errors.content.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 justify-end pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Cập nhật chương" : "Tạo chương mới"}
        </Button>
      </div>
    </form>
  );
}
