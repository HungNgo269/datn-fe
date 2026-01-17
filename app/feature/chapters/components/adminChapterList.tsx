"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  AudioLines,
  Loader2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    } catch (error) {
      toast.error("Tạo audio thất bại. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <>
      <div className="rounded-md border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="w-[100px] text-slate-700 font-semibold text-center">Thứ tự</TableHead>
              <TableHead className="text-slate-700 font-semibold">Tên chương</TableHead>
              <TableHead className="w-[100px] text-center text-slate-700 font-semibold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chapters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Không có chương truyện nào.
                </TableCell>
              </TableRow>
            ) : (
              chapters.map((chapter) => (
                <TableRow key={chapter.id}>
                  <TableCell className="font-medium text-center">{chapter.order}</TableCell>
                  <TableCell>{chapter.title}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link
                          href={`/books-admin/${bookSlug}/chapters/${chapter.slug}/edit`}
                        >
                          <DropdownMenuItem className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleGenerateAudio(chapter.id)}
                          disabled={generatingId === chapter.id}
                        >
                          {generatingId === chapter.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <AudioLines className="mr-2 h-4 w-4" />
                          )}
                          Tạo Audio
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer text-rose-600 focus:text-rose-600"
                          onClick={() => handleDeleteClick(chapter.slug)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa chương
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
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
