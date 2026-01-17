import { useState } from "react";
import { ExternalLink, MoreVertical } from "lucide-react";
import Image from "next/image";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Banner } from "../types/banner.types";
import { formatDate } from "@/lib/formatDate";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getValidBannerUrl } from "@/lib/utils";

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
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-[0_1px_1px_rgba(0,0,0,0.04)] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="w-[100px] text-slate-700">Ảnh </TableHead>
              <TableHead className="text-slate-700">Tiêu đề & Mô tả</TableHead>
              <TableHead className="text-slate-700">Vị trí hiển thị</TableHead>
              <TableHead className="text-slate-700">Khoảng thời gian</TableHead>
              <TableHead className="text-center text-slate-700">Thứ tự</TableHead>
              <TableHead className="text-slate-700">Trạng thái</TableHead>
              <TableHead className="text-right text-slate-700"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No banners found.
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow
                  key={banner.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <TableCell>
                    <HoverCard openDelay={100} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <div className="relative h-14 w-10 cursor-pointer overflow-hidden rounded-md border border-border shadow-sm group">
                          <Image
                            src={getValidBannerUrl(banner.imageUrl)}
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
                            src={getValidBannerUrl(banner.imageUrl)}
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
                    <div
                      className="truncate font-semibold text-slate-900"
                      title={banner.title}
                    >
                      {banner.title}
                    </div>
                    <div
                      className="truncate text-xs text-slate-500"
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

                  <TableCell className="text-sm text-slate-600">
                    <div>
                      <span className="font-medium text-slate-900">Start:</span>{" "}
                      {formatDate(banner.startDate!)}
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">End:</span>{" "}
                      {formatDate(banner.endDate!)}
                    </div>
                  </TableCell>

                  <TableCell className="text-center text-slate-600">
                    {banner.order}
                  </TableCell>

                  <TableCell>
                    {banner.isActive ? (
                      <Badge className="bg-success text-success-foreground hover:bg-success/90">
                        Đang Hoạt động
                      </Badge>
                    ) : (
                      <Badge>Ẩn</Badge>
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
                          onSelect={() => onEdit(banner)}
                          className="cursor-pointer"
                        >
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => setBannerToDelete(banner)}
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
        open={!!bannerToDelete}
        onOpenChange={(open) => !open && setBannerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa banner này</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác Banner {bannerToDelete?.title} sẽ
              bị xóa vĩnh viễn
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (bannerToDelete) {
                  onDelete(bannerToDelete.id);
                  setBannerToDelete(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
