"use client";

import { useTransition, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { AdminChapterForm } from "@/app/feature/chapters/components/adminChapterForm";
import { createChapter } from "@/app/feature/chapters/actions/chapters.actions";

export default function CreateChapterPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: any) => {
    startTransition(async () => {
      try {
        await createChapter(slug, data);
        toast.success("Tạo chương mới thành công");
        router.push(`/books-admin/${slug}/chapters`);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Tạo chương thất bại");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Thêm chương mới</h3>
        <p className="text-sm text-muted-foreground">
          Tạo chương mới cho cuốn sách này.
        </p>
      </div>
      <AdminChapterForm onSubmit={onSubmit} isSubmitting={isPending} bookSlug={slug} />
    </div>
  );
}
