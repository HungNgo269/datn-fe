"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { ApiError } from "@/lib/handleApiRequest";
import { toNumericPrice } from "@/lib/helper";
import { getUserPurchasedBooks } from "@/app/feature/payments/api/payments.api";
import type { BookPurchase } from "@/app/feature/payments/types/payment.type";

const formatPurchaseDate = (value?: string) => {
  if (!value) return "Không rõ ngày";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ ngày";
  return format(date, "dd/MM/yyyy");
};

const formatPrice = (value?: number | string | null) => {
  const numeric = toNumericPrice(value ?? 0);
  if (!numeric) return "Miễn phí";
  return `${numeric.toLocaleString("vi-VN")} VND`;
};

const getBookPrice = (purchase: BookPurchase) => {
  return purchase.price ?? purchase.book?.price ?? null;
};

export function PurchasedBooksSection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["payment", "purchases"],
    queryFn: async () => {
      try {
        return await getUserPurchasedBooks();
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 401) {
          return [] as BookPurchase[];
        }
        throw error;
      }
    },
    staleTime: 60 * 1000,
    retry: false,
  });

  const purchases = data ?? [];

  return (
    <section className="space-y-6 rounded-2xl p-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-primary">
          <ShoppingBag className="h-4 w-4" />
          <span>Sách đã mua</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Bộ sưu tập của bạn
        </h2>
        <p className="text-muted-foreground">
          Quản lý và đọc lại những cuốn sách bạn đã sở hữu
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-xl bg-muted/40"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 text-center">
          <p className="font-medium text-destructive">
            Không thể tải danh sách sách đã mua
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Vui lòng thử lại sau giây lát
          </p>
        </div>
      ) : purchases.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6 rounded-3xl border border-dashed border-border/60 bg-muted/5 p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/20 text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Chưa có cuốn sách nào
            </h3>
            <p className="max-w-xs text-muted-foreground mx-auto">
              Khám phá kho sách khổng lồ và bắt đầu xây dựng thư viện cá nhân của riêng bạn.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Khám phá ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900/40 dark:border-white/10"
            >
              {/* Glassmorphism Background Layer */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md dark:from-slate-800/40 dark:to-slate-900/10" />

              {/* Card Content */}
              <div className="relative z-10 flex flex-1 flex-col p-4">
                {/* Book Cover */}
                <Link
                  prefetch={false}
                  href={`/books/${purchase.book.slug}`}
                  className="relative mx-auto mb-5 block aspect-[2/3] w-full max-w-[180px] overflow-hidden rounded-lg shadow-md transition-shadow duration-300 group-hover:shadow-2xl"
                  aria-label={purchase.book.title}
                >
                  <ImageCard
                    bookImage={purchase.book.coverImage ?? undefined}
                    bookName={purchase.book.title}
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm border border-white/30">
                      Đọc ngay
                    </span>
                  </div>
                </Link>

                {/* Info */}
                <div className="flex flex-1 flex-col text-center">
                  <Link
                    prefetch={false}
                    href={`/books/${purchase.book.slug}`}
                    className="group/title block"
                  >
                    <h3 className="line-clamp-2 text-lg font-bold leading-tight text-foreground transition-colors group-hover/title:text-primary">
                      {purchase.book.title}
                    </h3>
                  </Link>
                  
                  <div className="mt-auto space-y-3 pt-4">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Đã mua</span>
                      <span className="font-medium text-foreground">
                        {formatPurchaseDate(purchase.purchasedAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Giá</span>
                      <span className="font-semibold text-primary">
                        {formatPrice(getBookPrice(purchase))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
