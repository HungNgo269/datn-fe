import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { Button } from "@/components/ui/button";
import { getBookBySlug } from "@/app/feature/books/action/books.action";
import { Book } from "@/app/feature/books/types/books.type";
import Cookies from "js-cookie";

export const metadata: Metadata = {
  title: "Thanh toÁn truyện | NextBook",
  description: "Hoàn thành thanh toán .",
};

type PaymentPageProps = {
  searchParams: Promise<{
    book?: string;
    chapter?: string;
  }>;
};

const formatPrice = (price?: Book["price"]) => {
  const value =
    typeof price === "number"
      ? price
      : typeof price === "string"
      ? parseFloat(price)
      : 0;
  if (!value || Number.isNaN(value)) {
    return " thanh toán";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const params = await searchParams;
  const accessToken = Cookies.get("accessToken");
  const targetBookSlug = params.book;
  const chapterSlug = params.chapter;

  const currentPath =
    `/payment` +
    (targetBookSlug
      ? `?book=${targetBookSlug}${chapterSlug ? `&chapter=${chapterSlug}` : ""}`
      : "");

  if (!accessToken) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }

  const book = targetBookSlug
    ? await getBookBySlug(targetBookSlug).catch(() => null)
    : null;

  const nextStepUrl =
    targetBookSlug && chapterSlug
      ? `/books/${targetBookSlug}/chapter/${chapterSlug}`
      : targetBookSlug
      ? `/books/${targetBookSlug}`
      : "/books";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-16 pt-24">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Thanh toán
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            Hoàn tất việc mua truyện
          </h1>
          {/* <p className="text-muted-foreground">
            Bạn phải có tài khoản          </p> */}
        </div>

        <div className="rounded-xl border border-border bg-card/60 p-6 shadow-sm">
          {book ? (
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="w-full max-w-[140px] overflow-hidden rounded-md border border-border sm:w-[140px]">
                <ImageCard bookImage={book.coverImage} bookName={book.title} />
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Sản phẩm
                  </p>
                  <h2 className="text-xl font-semibold text-foreground">
                    {book.title}
                  </h2>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    Tác giả:{" "}
                    <span className="text-foreground">
                      {book.authors
                        ?.map((author) => author.author.name)
                        .join(", ") || ""}
                    </span>
                  </p>
                  <p>
                    GIá :{" "}
                    <span className="text-foreground font-semibold">
                      {formatPrice(book.price)}
                    </span>
                  </p>
                </div>
                <div className="mt-auto flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex flex-1 items-center rounded-md bg-muted/60 px-3 py-2">
                    {/*  */}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">{/*  */}</div>
          )}
        </div>

        <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6">
          <h3 className="text-lg font-semibold text-primary"></h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-primary/90">
            <li>Thanh toán qua chuyển QR chen trong email.</li>
            <li>
              <Link
                href="mailto:support@nextbook.app"
                className="font-semibold underline"
              >
                support@nextbook.app
              </Link>
            </li>
            <li></li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="ghost" asChild>
            <Link href="/books">Chọn tác phẩ khác</Link>
          </Button>
          <Button asChild>
            <Link href={nextStepUrl}>Xác nhận</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
