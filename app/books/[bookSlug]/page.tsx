import type { Metadata } from "next";
import { Share2, BookOpen, Heart } from "lucide-react"; // Thêm Heart icon
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/app/store/useAuthStore";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { getBookBySlug } from "@/app/feature/books/action/books.action";
import { getChaptersOfBook } from "@/app/feature/chapters/actions/chapters.actions";
import { ChapterContainer } from "@/app/feature/chapters/components/chapterContainer";
import Header from "@/app/share/components/ui/header/header";
import FooterComponent from "@/app/share/components/ui/footer/footer";
import RecommendBook from "@/app/feature/books-recommends/components/recommendBook";
import FollowButton from "@/app/feature/books/components/followButton";
import BookDesc from "@/app/feature/books/components/bookDesc";
import { Button } from "@/components/ui/button";
import { AuthorInfo, AuthorsList } from "@/app/feature/books/types/books.type";

type PageProps = {
  params: Promise<{
    bookSlug: string;
  }>;
};

const getAuthorsString = (authors: AuthorsList[]) => {
  return authors?.map((a) => a.author.name).join(", ") || "Đang cập nhật";
};

export default async function BookPage({ params }: PageProps) {
  const user = useAuthStore.getInitialState().user;
  const { bookSlug } = await params;

  const [book, chapters] = await Promise.all([
    getBookBySlug(bookSlug),
    getChaptersOfBook(bookSlug),
  ]);

  if (!book) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p>Cuốn sách này đang lỗi hoặc không tồn tại.</p>
      </div>
    );
  }

  const firstChapter = chapters && chapters.length > 0 ? chapters[0] : null;
  console.log("bôk", book.coverImage);
  return (
    <>
      <Header />
      {book && (
        <div className="min-h-screen relative flex flex-col bg-background">
          <div className="container relative z-10 mx-auto  pt-8 md:pt-16 max-w-[1200px] flex-grow">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start mb-16">
              <div className="w-[160px] md:w-[220px] lg:w-[240px] flex-shrink-0 mx-auto md:mx-0 shadow-2xl rounded-lg overflow-hidden border border-border">
                <div className="aspect-[3/4] relative">
                  {book.coverImage && (
                    <ImageCard
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

                <div className="text-muted-foreground text-sm md:text-base font-medium mb-4 text-center md:text-left flex flex-wrap justify-center md:justify-start gap-2">
                  <span>
                    Tác giả:{" "}
                    <span className="text-muted-foreground">
                      {getAuthorsString(book.authors)}
                    </span>
                  </span>
                  {/* <span className="mx-2 hidden md:inline">•</span> */}
                  {/* <span>{book.status || "Đang tiến hành"}</span> */}
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
                      href={`/category/${category.category.slug}?page=1`}
                    >
                      <Badge
                        variant="outline"
                        className="bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1 text-xs transition-all rounded-full"
                      >
                        #{category.category.name}
                      </Badge>
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-auto">
                  <div className="w-full sm:w-auto flex-1 sm:flex-none">
                    <FollowButton
                      bookId={book.id}
                      userId={user?.id || undefined}
                    />
                  </div>

                  {firstChapter && (
                    <Link
                      href={`/book/${bookSlug}/${firstChapter.id}`}
                      className="w-full sm:w-auto flex-1 sm:flex-none"
                    >
                      <Button className="w-full sm:w-[180px] h-12 text-base font-bold bg-muted border-primary border text-foreground hover:bg-muted/80 rounded-sm shadow-none">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Đọc tập 1
                      </Button>
                    </Link>
                  )}

                  {/* <Button
                  variant="outline"
                  className="h-12 w-12 p-0 rounded-md border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white shrink-0 hidden sm:flex"
                >
                  <Share2 className="w-5 h-5" />
                </Button> */}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 pb-20">
              <div className="flex flex-col gap-6">
                <ChapterContainer
                  chapters={chapters}
                  totalChapters={chapters.length}
                />
              </div>

              <aside className="space-y-6 hidden lg:block">
                <div className="sticky top-24">
                  <RecommendBook />
                </div>
              </aside>

              <div className="lg:hidden mt-8">
                <h3 className="text-lg font-bold mb-4 text-foreground border-l-4 border-primary pl-3">
                  Có thể bạn thích
                </h3>
                <RecommendBook />
              </div>
            </div>
          </div>

          <FooterComponent />
        </div>
      )}
    </>
  );
}
