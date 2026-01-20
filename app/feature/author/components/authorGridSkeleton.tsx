const CARD_COUNT = 10;

export default function AuthorGridSkeleton() {
  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: CARD_COUNT }).map((_, index) => (
        <div
          key={index}
          className="flex w-full max-w-[230px] flex-col gap-3 rounded-xl border border-border/60 bg-muted/40 p-3"
        >
          <div className="aspect-[3/4] w-full rounded-lg bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted-foreground/20 animate-pulse" />
            <div className="h-3 w-full rounded bg-muted-foreground/20 animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-muted-foreground/20 animate-pulse" />
          </div>
          <div className="h-4 w-1/2 rounded bg-muted-foreground/20 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
