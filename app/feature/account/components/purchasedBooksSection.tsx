"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { ApiError } from "@/lib/handleApiRequest";
import { toNumericPrice } from "@/lib/helper";
import { getUserPurchasedBooks } from "@/app/feature/payments/api/payments.api";
import type { BookPurchase } from "@/app/feature/payments/types/payment.type";
import { format } from "date-fns";

const formatPurchaseDate = (value?: string) => {
  if (!value) return "Không rõ ngày";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ ngày";
  return format(date, "MMM dd, yyyy");
};

const formatPrice = (value?: number | string | null) => {
  const numeric = toNumericPrice(value ?? 0);
  if (!numeric) return "Miễn phí";
  return `${numeric.toLocaleString("en-US")} VND`;
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
    <section className="rounded-2xl p-6 space-y-4">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" />
          Sách đã mua
        </p>
        <h2 className="text-2xl font-semibold text-foreground mt-1">
          Sách bạn sở hữu
        </h2>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          Đang tải danh sách mua...
        </p>
      ) : isError ? (
        <p className="text-sm text-destructive">Không thể tải danh sách mua.</p>
      ) : purchases.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Bạn chưa mua cuốn sách nào.
        </p>
      ) : (
        <ul className="space-y-3">
          {purchases.map((purchase) => (
            <li
              key={purchase.id}
              className="rounded-xl border border-border/60 p-4"
            >
              <div className="flex gap-4">
                <Link
                  prefetch={true}
                  href={`/books/${purchase.book.slug}`}
                  className="block h-24 w-16 shrink-0 overflow-hidden rounded-md border border-border/60"
                  aria-label={purchase.book.title}
                >
                  <ImageCard
                    bookImage={purchase.book.coverImage ?? undefined}
                    bookName={purchase.book.title}
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    prefetch={true}
                    href={`/books/${purchase.book.slug}`}
                    className="block"
                  >
                    <h3 className="text-base font-semibold text-foreground line-clamp-2 hover:underline">
                      {purchase.book.title}
                    </h3>
                  </Link>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Mua vào {formatPurchaseDate(purchase.purchasedAt)}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Giá: {formatPrice(getBookPrice(purchase))}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
