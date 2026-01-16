import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên tác giả</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24">
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : authors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              authors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell className="max-w-[150px] truncate font-medium">
                    {author.name}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-muted-foreground">
                    {author.slug}
                  </TableCell>
                  <TableCell className="max-w-[350px]">
                    {author.bio ? (
                      <div
                        className="truncate line-clamp-1"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeRichHtml(author.bio),
                        }}
                      />
                    ) : (
                      "--"
                    )}
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(author)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Bạn có chắc chắn muốn xóa?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Danh mục{" "}
                            {author.name}
                            sẽ bị xóa vĩnh viễn.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(author.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
