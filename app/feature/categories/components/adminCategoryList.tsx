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
import { Category } from "@/app/feature/categories/types/listCategories";

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
  isFetching?: boolean;
}

export function AdminCategoryList({
  categories,
  onEdit,
  onDelete,
  isDeleting,
  isFetching,
}: CategoriesTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-[0_1px_1px_rgba(0,0,0,0.04)] overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow>
            <TableHead className="text-slate-700">Thể loại</TableHead>
            <TableHead className="text-slate-700">Slug</TableHead>
            <TableHead className="text-slate-700">Mô tả</TableHead>
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
          ) : categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Không tìm thấy thể loại
              </TableCell>
            </TableRow>
          ) : (
            categories.map((cat) => (
              <TableRow
                key={cat.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <TableCell className="font-semibold text-slate-900">
                  {cat.name}
                </TableCell>
                <TableCell className="text-slate-500">{cat.slug}</TableCell>
                <TableCell className="text-slate-600">
                  {cat.description || "--"}
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
                        onSelect={() => onEdit(cat)}
                        className="cursor-pointer"
                      >
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="cursor-pointer text-rose-600 focus:text-rose-600"
                            disabled={isDeleting}
                          >
                            Xóa
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Xóa thể loại này ư
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác {cat.name} sẽ bị
                              xóa vĩnh viễn
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(cat.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
