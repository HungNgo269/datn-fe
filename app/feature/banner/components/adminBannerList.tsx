import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
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
import { Badge } from "@/components/ui/badge";
import { Banner } from "../types/banner.types";
import { formatDate } from "@/lib/formatDate";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface BannersTableProps {
  banners: Banner[];
  onEdit: (banner: Banner) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export function AdminBannerList({
  banners,
  onEdit,
  onDelete,
  isDeleting,
}: BannersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Hình ảnh</TableHead>
            <TableHead>Tiêu đề & Mô tả</TableHead>
            <TableHead>Vị trí</TableHead>
            <TableHead>Thời gian hiển thị</TableHead>
            <TableHead className="text-center">Thứ tự</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Chưa có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            banners.map((banner) => (
              <TableRow key={banner.id}>
                <TableCell>
                  <HoverCard openDelay={100} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <div className="relative h-14 w-10 cursor-pointer overflow-hidden rounded-md border border-border shadow-sm group">
                        <Image
                          src={banner.imageUrl}
                          width={40}
                          height={56}
                          alt={banner.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
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
                          src={banner.imageUrl!}
                          fill
                          alt={banner.title}
                          className="object-cover"
                        />
                      </div>
                      <div className="bg-popover p-3">
                        <h4 className="max-w-[300px] line-clamp-2 text-sm font-semibold">
                          {banner.title}
                        </h4>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </TableCell>

                <TableCell className="max-w-[250px]">
                  <div className="truncate font-medium" title={banner.title}>
                    {banner.title}
                  </div>
                  <div
                    className="truncate text-xs text-muted-foreground"
                    title={banner.description!}
                  >
                    {banner.description || "--"}
                  </div>
                  {banner.linkUrl && (
                    <a
                      href={banner.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Link
                    </a>
                  )}
                </TableCell>

                <TableCell>
                  <Badge variant="outline">{banner.position}</Badge>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Bắt đầu:</span>{" "}
                    {formatDate(banner.startDate!)}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Kết thúc:</span>{" "}
                    {formatDate(banner.endDate!)}
                  </div>
                </TableCell>

                <TableCell className="text-center">{banner.order}</TableCell>

                <TableCell>
                  {banner.isActive ? (
                    <Badge className="bg-success text-success-foreground hover:bg-success/90">
                      Hiển thị
                    </Badge>
                  ) : (
                    <Badge>Đã ẩn</Badge>
                  )}
                </TableCell>

                <TableCell className="space-x-2 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(banner)}
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
                          Hành động này không thể hoàn tác. Banner <b>{banner.title}</b>
                          sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(banner.id)}
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
  );
}
