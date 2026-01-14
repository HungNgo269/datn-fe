import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { Button } from "@/components/ui/button";
import { getBookBySlugAction } from "@/app/feature/books/action/books.action";
import { Book } from "@/app/feature/books/types/books.type";
import { BookPaymentActions } from "@/app/feature/payments/components/BookPaymentActions";

export const metadata: Metadata = {
  title: "Thanh toAI?n truyA¦Iśn | NextBook",
  description: "HoaI?n thaI?nh thanh toaI?n.",
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
    return "Thanh toaI?n";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const params = await searchParams;
  const accessToken = cookies().get("accessToken")?.value;
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
    ? await getBookBySlugAction(targetBookSlug).catch(() => null)
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
            Thanh toaI?n
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            HoaI?n tA›I?t viA¦Iśc mua truyA¦Iśn
          </h1>
        </div>

        <div className="rounded-xl border border-border/60 p-6 shadow-sm">
          {book ? (
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="w-full max-w-[140px] overflow-hidden rounded-md border border-border sm:w-[140px]">
                <ImageCard bookImage={book.coverImage} bookName={book.title} />
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    SaI?n phA›I%m
                  </p>
                  <h2 className="text-xl font-semibold text-foreground">
                    {book.title}
                  </h2>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    TaI?c giaI%:{" "}
                    <span className="text-foreground">
                      {book.authors
                        ?.map((author) => author.author.name)
                        .join(", ") || ""}
                    </span>
                  </p>
                  <p>
                    GIaI? :{" "}
                    <span className="text-foreground font-semibold">
                      {formatPrice(book.price)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              KhA'ng tAÿm th §y thA'ng tin sA­ch.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6">
          <h3 className="text-lg font-semibold text-primary">
            H ¯- tr ¯© thanh toAI?n
          </h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-primary/90">
            <li>Thanh toaI?n qua Stripe vAÿ ho ¯§n tA›I	t sau khi xA¡c nh §-n.</li>
            <li>
              <Link
                href="mailto:support@nextbook.app"
                className="font-semibold underline"
              >
                support@nextbook.app
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="ghost" asChild>
            <Link href="/books">ChoIśn taI?c phA›I% khaI?c</Link>
          </Button>
          {book ? (
            <BookPaymentActions
              bookId={book.id}
              accessType={book.accessType}
              price={book.price}
              className="sm:w-auto"
            />
          ) : (
            <Button asChild>
              <Link href={nextStepUrl}>XaI?c nhA›Iśn</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
