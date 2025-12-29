const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-primary/15 before:to-transparent before:content-['']";

const surfaceShell =
  "relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm";
const solidBlock = "animate-pulse rounded-lg bg-muted";
const softBlock = "animate-pulse rounded-md bg-muted-foreground/20";
const chipBlock = "animate-pulse rounded-full bg-muted-foreground/30";

export function SlideSkeleton() {
  return (
    <div className={`${shimmer} ${surfaceShell} mx-auto w-full`}>
      <div className="relative h-[320px] sm:h-[380px] md:h-[420px] lg:h-[500px]">
        <div className="absolute inset-0 bg-muted/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 to-transparent dark:from-background/80" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-2xl space-y-4 p-6 sm:p-10 lg:p-12">
            <div className="space-y-3">
              <div className={`h-6 sm:h-8 lg:h-10 w-3/4 ${softBlock}`} />
              <div className={`h-6 sm:h-8 lg:h-10 w-1/2 ${softBlock}`} />
            </div>
            <div className="space-y-2">
              <div className={`h-4 sm:h-5 w-full ${softBlock}`} />
              <div className={`h-4 sm:h-5 w-2/3 ${softBlock}`} />
            </div>
            <div className={`h-11 sm:h-12 w-32 ${solidBlock}`} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-6 hidden md:flex gap-3">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className={`h-11 w-11 shadow-lg ${solidBlock}`} />
        ))}
      </div>

      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 py-2">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`h-2.5 w-2.5 rounded-full ${
              index === 0
                ? "bg-primary/60"
                : "bg-muted-foreground/30 animate-pulse"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

type Variant = "lg" | "sm";

const CARD_MAP = {
  lg: {
    card: "xl:w-[230px] lg:w-[170px] md:w-[130px] w-full h-fit",
    image:
      "xl:w-[230px] xl:h-[250px] lg:w-[170px] lg:h-[221px] md:w-[130px] h-[207px] w-full",
  },
  sm: {
    card: "xl:w-[160px] lg:w-[130px] md:w-[130px] w-full h-fit",
    image:
      "xl:w-[160px] xl:h-[207px] lg:w-[130px] lg:h-[182px] md:w-[130px] h-[207px] w-full",
    title: "h-3",
    meta: "h-3",
  },
} as const;

export function BookCardSkeleton({ variant = "lg" }: { variant?: Variant }) {
  const s = CARD_MAP[variant];

  return (
    <div className={`flex flex-col ${s.card}`}>
      <div
        className={`${shimmer} ${surfaceShell} flex flex-col gap-3 p-2 h-full`}
      >
        <div className="w-full overflow-hidden rounded-[8px]">
          <div className={`${s.image} ${solidBlock}`} />
        </div>
      </div>
    </div>
  );
}

export function TrendingBookSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className={`${shimmer} relative flex h-[80px] items-center gap-2 overflow-hidden`}
        >
          <div className="absolute inset-0 bg-muted/40" />
          <div className="relative z-10 flex h-full w-full items-center gap-2">
            <div className="relative h-full min-w-[60px] overflow-hidden rounded-[4px]">
              <div className={`${solidBlock} h-full w-full rounded-[4px]`} />
            </div>
            <div className="flex h-full min-w-[32px] items-center justify-center">
              <div className={`h-8 w-8 rounded-md ${softBlock}`} />
            </div>
            <div className="flex h-full flex-1 flex-col justify-center gap-2">
              <div className={`h-4 w-3/4 ${softBlock}`} />
              <div className={`h-3 w-1/2 ${softBlock}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export function RecommendBookSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(10)].map((_, index) => (
        <div
          key={index}
          className={`${shimmer} relative flex h-[80px] items-center gap-2 overflow-hidden`}
        >
          <div className="absolute inset-0 bg-muted/40" />
          <div className="relative z-10 flex h-full w-full items-center gap-2">
            <div className="relative h-full min-w-[60px] overflow-hidden rounded-[4px]">
              <div className={`${solidBlock} h-full w-full rounded-[4px]`} />
            </div>

            <div className="flex h-full flex-1 flex-col justify-center gap-2">
              <div className={`h-4 w-3/4 ${softBlock}`} />
              <div className={`h-3 w-1/2 ${softBlock}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export function ChapterCardGridSkeleton() {
  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-2 gap-6 lg:grid-cols-4">
        {[...Array(12)].map((_, index) => (
          <div key={index} className={`${shimmer} ${surfaceShell} p-2`}>
            <div className="flex flex-col gap-3">
              <div className="relative overflow-hidden rounded-xl">
                <div className={`w-full aspect-[2/3] ${solidBlock}`} />
                <div className="flex items-center justify-between text-sm">
                  {[...Array(3)].map((_, section) => (
                    <div key={section} className="flex items-center gap-2">
                      <div className={`h-3.5 w-3.5 ${chipBlock}`} />
                      <div className={`h-3 w-8 ${softBlock}`} />
                    </div>
                  ))}
                  <div className="space-y-1.5">
                    <div className={`h-4 w-full ${softBlock}`} />
                    <div className={`h-4 w-2/3 ${softBlock}`} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className={`h-4 w-full ${softBlock}`} />
                <div className={`h-3 w-20 ${softBlock}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export function BookListSkeleton({
  variant = "sm",
  count = 30,
}: {
  variant?: Variant;
  count?: number;
}) {
  return (
    <div className="w-full gap-2 grid grid-cols-2 md:grid-cols-5 md:overflow-visible md:place-items-center md:justify-center justify-items-center">
      {Array.from({ length: count }).map((_, index) => (
        <BookCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return <div className="h-16 w-full bg-muted/60 animate-pulse rounded-b-lg" />;
}

export function CategoryShowcaseSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="h-6 w-48 bg-muted animate-pulse rounded-md" />
      <div className="flex items-center justify-between gap-4">
        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
        <div className="h-5 w-24 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <BookCardSkeleton key={index} variant="lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
