"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminChapterForm } from "@/app/feature/chapters/components/adminChapterForm";
import { updateChapter } from "@/app/feature/chapters/actions/chapters.actions";
import { ChapterContent } from "@/app/feature/chapters/types/chapter.type";

interface EditChapterClientProps {
  initialData: ChapterContent;
  bookSlug: string;
  chapterSlug: string;
}

export function EditChapterClient({
  initialData,
  bookSlug,
  chapterSlug,
}: EditChapterClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: any) => {
    startTransition(async () => {
      try {
        await updateChapter(bookSlug, chapterSlug, data);
        toast.success("Cập nhật chương thành công");
        router.push(`/books-admin/${bookSlug}/chapters`);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Cập nhật chương thất bại");
      }
    });
  };

  return (
    <AdminChapterForm
      initialData={initialData}
      onSubmit={onSubmit}
      isSubmitting={isPending}
      bookSlug={bookSlug}
    />
  );
}
