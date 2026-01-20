import { useState } from "react";
import { Loader2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AuthorInfo } from "../types/authors.types";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";

interface AuthorsTableProps {
  authors: AuthorInfo[];
  onEdit: (author: AuthorInfo) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
  isFetching?: boolean;
}

export function AdminAuthorList({
  authors,
  onEdit,
  onDelete,
  isDeleting,
  isFetching,
}: AuthorsTableProps) {
  const [authorToDelete, setAuthorToDelete] = useState<AuthorInfo | null>(null);

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="text-slate-700">Tác giả</TableHead>
              <TableHead className="text-slate-700">Slug</TableHead>
              <TableHead className="text-slate-700">Giới thiệu</TableHead>
              <TableHead className="text-right text-slate-700"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24">
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin text-slate-500" />
                  </div>
                </TableCell>
              </TableRow>
            ) : authors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Không tìm thấy tác giả
                </TableCell>
              </TableRow>
            ) : (
              authors.map((author) => (
                <TableRow
                  key={author.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <TableCell className="max-w-[150px] truncate font-semibold text-slate-900">
                    {author.name}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-slate-500">
                    {author.slug}
                  </TableCell>
                  <TableCell className="max-w-[350px] text-slate-600">
                    {author.bio ? (
                      <div
                        className="truncate line-clamp-1"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeRichHtml(author.bio),
                        }}
                      />
                    ) : (
                      "đang cập nhật"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-transparent"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                          onSelect={() => onEdit(author)}
                          className="cursor-pointer"
                        >
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => setAuthorToDelete(author)}
                          className="cursor-pointer text-rose-600 focus:text-rose-600"
                          disabled={isDeleting}
                        >
                          Xóa
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

      <AlertDialog
        open={!!authorToDelete}
        onOpenChange={(open) => !open && setAuthorToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tác giả này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác {authorToDelete?.name} sẽ bị xóa
              vĩnh viễn
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (authorToDelete) {
                  onDelete(authorToDelete.id);
                  setAuthorToDelete(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
