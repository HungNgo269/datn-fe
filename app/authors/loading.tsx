import { HeaderSkeleton } from "@/app/share/components/ui/skeleton/skeleton";
import AuthorGridSkeleton from "@/app/feature/author/components/authorGridSkeleton";

export default function LoadingAuthors() {
  return (
    <div className="overflow-x-hidden">
      <div className="mx-auto w-full">
        <HeaderSkeleton />
      </div>
      <main className="mx-auto mt-20 w-full px-3 md:w-[700px] lg:w-[950px] xl:w-[1190px] lg:px-0">
        <section className="flex flex-col gap-6 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
          <div className="space-y-3">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-8 w-64 rounded bg-muted animate-pulse" />
            <div className="h-4 w-full max-w-[600px] rounded bg-muted/80 animate-pulse" />
          </div>
          <AuthorGridSkeleton />
        </section>
      </main>
    </div>
  );
}
