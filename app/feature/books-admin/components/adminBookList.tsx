"use client";

import { Edit, Eye, Trash2 } from "lucide-react";

import { formatDate } from "@/lib/formatDate";
import { Book } from "../../books/types/books.type";

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

interface BookListProps {
  books: Book[];
  onEdit?: (book: Book) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export function AdminBookList({
  books,
  onEdit,
  onDelete,
  isDeleting,
}: BookListProps) {
  console.log(books);

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Ảnh bìa</TableHead>
            <TableHead>Tên tác phẩm</TableHead>
            <TableHead>Tác giả</TableHead>
            <TableHead className="text-center">Số chương</TableHead>
            <TableHead className="text-center">Ngày đăng tải</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-center">Giá</TableHead>
            <TableHead className="text-center">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24">
                Chưa có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            books.map((book) => (
              <TableRow key={book.id}>
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
                                    prefetch={true}
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

                <TableCell className="font-medium text-foreground  truncate max-w-[300px]">
                  {book.title}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  <div className="flex flex-row items-center overflow-hidden max-w-full">
                    <div className="text-xs text-muted-foreground truncate">
                      {book.authors &&
                        book.authors.map((author, index) => (
                          <span key={author.author.id}>
                            <Link
                              prefetch={true}
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
                </TableCell>
                <TableCell className="text-muted-foreground text-center">
                  {book.totalChapters}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm text-center">
                  {book.createdAt ? `${formatDate(book.createdAt)}` : "--"}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center text-xs font-medium `}
                  >
                    {/* {book.status === "PUBLISHED" ? "Published" : "Draft"} */}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-center">
                  {book.price ? `${book.price} vnđ` : "--"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-info"
                        onClick={() => onEdit(book)}
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          disabled={isDeleting}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Bạn có chắc chắn muốn xóa?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Sách {book.title}{" "}
                            sẽ bị xóa vĩnh viễn.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(book.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
