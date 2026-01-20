"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  AudioLines,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChapterCardProps } from "../types/chapter.type";
import { generateAudio, deleteChapter } from "../actions/chapters.actions";

interface AdminChapterListProps {
  chapters: ChapterCardProps[];
  bookSlug: string;
}

export function AdminChapterList({
  chapters,
  bookSlug,
}: AdminChapterListProps) {
  const router = useRouter();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDeleteClick = (slug: string) => {
    setItemToDelete(slug);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      startDeleteTransition(async () => {
        try {
          await deleteChapter(bookSlug, itemToDelete);
          toast.success("Đã xóa chương thành công");
          router.refresh();
        } catch (error) {
           console.error(error);
          toast.error("Xóa chương thất bại");
        } finally {
          setItemToDelete(null);
        }
      });
    }
  };

  const handleGenerateAudio = async (chapterId: number) => {
    try {
      setGeneratingId(chapterId);
      await generateAudio(chapterId);
      toast.success("Yêu cầu tạo audio đã được gửi thành công!");
      router.refresh();
    } catch (error) {
      toast.error("Tạo audio thất bại. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <>
      <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="w-[80px] text-slate-700 font-semibold text-center">
                STT
              </TableHead>
              <TableHead className="text-slate-700 font-semibold">
                Tên chương
              </TableHead>

              <TableHead className="w-[280px] text-center text-slate-700 font-semibold">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chapters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  Không có chương truyện nào.
                </TableCell>
              </TableRow>
            ) : (
              chapters.map((chapter) => {
                const hasAudio = chapter.hasAudio || !!chapter.audio;
                const isGenerating = generatingId === chapter.id;
                
                return (
                  <TableRow key={chapter.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-center text-slate-700">
                      {chapter.order}
                    </TableCell>
                    <TableCell className="font-medium">
                      {chapter.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {/* <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          asChild
                        >
                          <Link
                            href={`/books-admin/${bookSlug}/chapters/${chapter.slug}/edit`}
                          >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                            Sửa
                          </Link>
                        </Button> */}

                        <Button
                          variant={hasAudio ? "secondary" : "default"}
                          size="sm"
                          className="h-8"
                          onClick={() => handleGenerateAudio(chapter.id)}
                          disabled={hasAudio || isGenerating}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              Đang tạo...
                            </>
                          ) : hasAudio ? (
                            <>
                              <Check className="mr-1.5 h-3.5 w-3.5" />
                              Đã có audio
                            </>
                          ) : (
                            <>
                              <AudioLines className="mr-1.5 h-3.5 w-3.5" />
                              Thêm audio
                            </>
                          )}
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8"
                          onClick={() => handleDeleteClick(chapter.slug)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Chương truyện sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
