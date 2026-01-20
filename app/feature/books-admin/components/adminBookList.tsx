"use client";

import { Loader2, MoreVertical } from "lucide-react";

import { formatDate } from "@/lib/formatDate";
import { Book } from "../../books/types/books.type";

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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface BookListProps {
  books: Book[];
  onEdit?: (book: Book) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
  isFetching?: boolean;
}

export function AdminBookList({
  books,
  onEdit,
  onDelete,
  isDeleting,
  isFetching,
}: BookListProps) {
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-[0_1px_1px_rgba(0,0,0,0.04)] overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow>
            <TableHead className="w-[100px] text-slate-700">Ảnh bìa</TableHead>
            <TableHead className="text-slate-700">Tên sách</TableHead>
            <TableHead className="text-slate-700">Tác giả</TableHead>
            <TableHead className="text-center text-slate-700">
              Số chương
            </TableHead>
            <TableHead className="text-center text-slate-700">
              Ngày tạo
            </TableHead>
            <TableHead className="text-center text-slate-700">
              Trạng thái
            </TableHead>
            <TableHead className="text-center text-slate-700">
              Đơn giá
            </TableHead>
            <TableHead className="text-center text-slate-700"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isFetching ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24">
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin text-slate-500" />
                </div>
              </TableCell>
            </TableRow>
          ) : books.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24">
                No books found.
              </TableCell>
            </TableRow>
          ) : (
            books.map((book) => (
              <TableRow
                key={book.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <TableCell>
                  <HoverCard openDelay={100} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <div className="relative w-10 h-14 cursor-pointer overflow-hidden rounded-md border border-border shadow-sm group">
                        <Image
                          src={book.coverImage}
                          width={40}
                          height={56}
                          alt={book.title}
                          className="object-cover w-full h-full transition-transform group-hover:scale-110"
                        />
                      </div>
                    </HoverCardTrigger>

                    <HoverCardContent
                      side="right"
                      align="start"
                      className="w-64 p-0 overflow-hidden shadow-2xl"
                    >
                      <div className="relative w-full aspect-[2/3]">
                        <Image
                          src={book.coverImage}
                          fill
                          alt={book.title}
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3 bg-popover">
                        <h4 className="font-semibold text-sm line-clamp-2 max-w-[300px]">
                          {book.title}
                        </h4>
                        <div className="flex flex-row items-center overflow-hidden max-w-full">
                          <div className="text-xs text-muted-foreground truncate">
                            {book.authors &&
                              book.authors.map((author, index) => (
                                <span key={author.author.id}>
                                  <Link
                                    prefetch={false}
                                    href={`${book.viewCount}`}
                                    className="hover:underline"
                                  >
                                    {author.author.name}
                                  </Link>
                                  {index < book.authors.length - 1 && ", "}
                                </span>
                              ))}
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2"></div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </TableCell>

                <TableCell className="font-semibold text-slate-900 truncate max-w-[300px]">
                  {book.title}
                </TableCell>

                <TableCell className="text-slate-500">
                  <div className="flex flex-row items-center overflow-hidden max-w-full">
                    <div className="text-xs text-slate-500 truncate">
                      {book.authors &&
                        book.authors.map((author, index) => (
                          <span key={author.author.slug}>
                            <Link
                              prefetch={false}
                              href={`/authors/${author.author.slug}`}
                              className="hover:underline"
                            >
                              {author.author.name}
                            </Link>
                            {index < book.authors.length - 1 && ", "}
                          </span>
                        ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 text-center">
                  <Link
                    href={`/books-admin/${book.slug}/chapters`}
                    className="hover:underline text-primary font-medium"
                  >
                    {book.totalChapters}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-600 text-sm text-center">
                  {book.createdAt ? `${formatDate(book.createdAt)}` : "--"}
                </TableCell>
                <TableCell className="text-center">
                  {book.accessType === "FREE" && (
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    >
                      Miễn phí
                    </Badge>
                  )}
                  {book.accessType === "PURCHASE" && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50"
                    >
                      Trả phí
                    </Badge>
                  )}
                  {book.accessType === "MEMBERSHIP" && (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50"
                    >
                      Hội viên
                    </Badge>
                  )}
                  {!book.accessType && <span className="text-slate-500">--</span>}
                </TableCell>
                <TableCell className="text-slate-600 text-center">
                  {book.price ? `${book.price} VND` : "--"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:bg-transparent"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        {onEdit ? (
                          <DropdownMenuItem
                            onSelect={() => onEdit(book)}
                            className="cursor-pointer"
                          >
                            Chỉnh sửa
                          </DropdownMenuItem>
                        ) : null}
                        <Link href={`/books-admin/${book.slug}/chapters`}>
                          <DropdownMenuItem className="cursor-pointer">
                            Quản lý chương
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => setBookToDelete(book)}
                          className="cursor-pointer text-rose-600 focus:text-rose-600"
                          disabled={isDeleting}
                        >
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!bookToDelete}
        onOpenChange={(open) => !open && setBookToDelete(null)}
      >
        <AlertDialogContent className="rounded-2xl border border-slate-200 bg-white p-6 shadow-none">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-lg font-semibold text-slate-900">
              Bạn thực sự muốn xóa cuốn sách này
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-600">
              Hành động này không thể hoàn tác {bookToDelete?.title} sẽ bị xóa
              vĩnh viễn
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 border-t border-slate-200 pt-4">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (bookToDelete) {
                  onDelete(bookToDelete.id);
                  setBookToDelete(null);
                }
              }}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
