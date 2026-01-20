import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { getChaptersOfBook } from "@/app/feature/chapters/actions/chapters.actions";
import { ChapterContainer } from "@/app/feature/chapters/components/chapterContainer";
import Header from "@/app/share/components/ui/header/header";
import FooterComponent from "@/app/share/components/ui/footer/footer";
import { FavoriteButton } from "@/app/feature/favorites/components/FavoriteButton";
import BookDesc from "@/app/feature/books/components/bookDesc";
import { RecommendBookSkeleton } from "@/app/share/components/ui/skeleton/skeleton";
import { BookAudioPlayButton } from "@/app/feature/book-audio/components/BookAudioPlayButton";
import { ContinueReadingButton } from "@/app/feature/books-continue/components/ContinueReadingButton";
import RecommendedSimilarBooks from "@/app/feature/books-recommends/components/RecommendedSimilarBooks";
import { getBookBySlugAction } from "@/app/feature/books/action/books.action";
import { getBookPurchaseStatusAction, getUserSubscriptionAction } from "@/app/feature/payments/action/payments.action";
import { BookPaymentActions } from "@/app/feature/payments/components/BookPaymentActions";
import { PremiumBanner } from "@/app/share/components/banner/PremiumBanner";

type PageProps = {
  params: Promise<{
    bookSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookSlug: string }>;
}): Promise<Metadata> {
  const { bookSlug } = await params;
  try {
    const book = await getBookBySlugAction(bookSlug);
    if (book?.title) {
      return { title: `${book.title} | NextBook` };
    }
  } catch {
    // Fall through to default title.
  }
  return { title: "Book | NextBook" };
}

export default async function BookPage({ params }: PageProps) {
  const { bookSlug } = await params;

  const book = await getBookBySlugAction(bookSlug);
  
  if (!book) {

    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p>Cuốn sách này đang lỗi hoặc không tồn tại.</p>
      </div>
    );
  }


  const [chapters, purchaseStatus, subscription] = await Promise.all([
    getChaptersOfBook(bookSlug),
    getBookPurchaseStatusAction(book.id),
    getUserSubscriptionAction(),
  ]);

  const firstChapter = chapters && chapters.length > 0 ? chapters[0] : null;
  return (
    <>
      <Header />
      {book && (
        <div className="min-h-screen relative flex flex-col bg-background px-5">
          <div className="container relative z-10 mx-auto  pt-8 md:pt-16 max-w-[1200px] flex-grow">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start mb-16">
              <div className="w-[160px] md:w-[220px] lg:w-[240px] flex-shrink-0 mx-auto md:mx-0 shadow-2xl rounded-lg overflow-hidden border border-border">
                <div className="aspect-[3/4] relative">
                  {book.coverImage && (
                    <ImageCard
                      key={book.id}
                      bookImage={book.coverImage}
                      bookName={book.title}
                      priority={true}
                    />
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col w-full text-">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight text-center md:text-left drop-shadow-md">
                  {book.title}
                </h1>
                <div className="text-sm md:text-base font-medium mb-4 text-center md:text-left flex flex-col md:flex-row gap-2">
                  <span className="text-muted-foreground">Tác giả:</span>
                  <div className="flex flex-wrap justify-center md:justify-start gap-x-1 items-center">
                    {book.authors?.length ? (
                      book.authors.map(({ author }, index) => {
                        const slug = author.slug;
                        const href = slug
                          ? `/authors/${slug}`
                          : `/books?author=${encodeURIComponent(
                              author.name
                            )}&page=1`;
                        return (
                          <span key={author.id}>
                            <Link href={href} prefetch={true}>
                              {author.name}
                            </Link>
                            {index < book.authors.length - 1 && ", "}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Đang cập nhật
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-5 text-muted-foreground text-sm md:text-base line-clamp-3 md:line-clamp-4 max-w-3xl">
                  <BookDesc
                    content={book.description || "Chưa có mô tả cho sách này."}
                    collapsedHeight={72}
                    className="text-muted-foreground/90"
                  />
                </div>

                <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
                  {book.categories.map((category) => (
                    <Link
                      key={category.categoryId}
                      href={`/books?category=${encodeURIComponent(
                        category.category.slug
                      )}&page=1`}
                      prefetch={true}
                    >
                      <div className="rounded-sm bg-card text-sm px-2 py-1">
                        #{category.category.name}
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-auto">
                  <div className="w-full sm:w-auto">
                    <FavoriteButton
                      bookId={book.id}
                      className="w-full sm:w-auto h-12"
                    />
                  </div>

                  <BookPaymentActions
                    bookId={book.id}
                    accessType={book.accessType}
                    price={book.price}
                    isOnPromotion={book.isOnPromotion}
                    discountPercent={book.discountPercent}
                  />

                  {firstChapter && (
                    <ContinueReadingButton
                      bookSlug={bookSlug}
                      defaultChapterSlug={firstChapter.slug}
                      defaultChapterTitle={firstChapter.title}
                      className="flex-2 sm:flex-none"
                    />
                  )}
                  <div className="w-full sm:w-auto flex justify-center sm:justify-start">
                    {(() => {
                      const audioChapters = chapters
                        ?.filter((c) => c.audio || c.hasAudio)
                        .sort((a, b) => a.order - b.order);

                      if (!audioChapters || audioChapters.length === 0)
                        return null;

                      return (
                        <BookAudioPlayButton
                          bookSlug={book.slug}
                          bookTitle={book.title}
                          coverImage={book.coverImage}
                          chapters={audioChapters.map((chapter) => ({
                            id: chapter.id.toString(),
                            title: chapter.title,
                            duration: chapter.audio?.duration ?? 0,
                            date: chapter.createdAt
                              ? new Date(chapter.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )
                              : undefined,
                            isFree:
                              (book.freeChapters === undefined ||
                                chapter.order <= book.freeChapters) ??
                              true,
                          }))}
                          accessType={book.accessType}
                          isPurchased={purchaseStatus?.purchased || false}
                          isSubscribed={
                            subscription?.status === "ACTIVE" ||
                            subscription?.status === "TRIALING"
                          }
                        />
                      );
                    })()}
                  </div>


              </div>
            </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 pb-20">
              <div className="flex flex-col gap-6">
              <ChapterContainer
                  bookId={book.id}
                  chapters={chapters}
                  totalChapters={chapters.length}
                  freeChapters={book.freeChapters}
                  accessType={book.accessType?.toLowerCase()}
                  isPurchased={purchaseStatus?.purchased || false}
                  isSubscribed={subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING'}
                  bookTitle={book.title}
                  bookCoverImage={book.coverImage}
                  bookSlug={book.slug}
                />
              </div>

              <aside className="hidden lg:block self-start space-y-2 sticky top-0">
                <div className="mb-6">
                  <PremiumBanner />
                </div>
                <Suspense fallback={<RecommendBookSkeleton />}>
                  <RecommendedSimilarBooks bookId={book.id} limit={5} />
                </Suspense>
              </aside>

              <div className="lg:hidden mt-8">
                <div className="mb-8">
                  <PremiumBanner />
                </div>
           
                <Suspense fallback={<RecommendBookSkeleton />}>
                  <RecommendedSimilarBooks bookId={book.id} limit={10} />
                </Suspense>
              </div>
            </div>
          </div>

          <FooterComponent />
        </div>
      )}
    </>
  );
}
