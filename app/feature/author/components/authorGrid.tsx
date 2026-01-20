import AuthorCard from "./authorCard";
import { AuthorInfo } from "../types/authors.types";

interface AuthorGridProps {
  authors: AuthorInfo[];
}

export default function AuthorGrid({ authors }: AuthorGridProps) {
  if (!authors?.length) {
    return (
      <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/50 bg-muted/10 p-10 text-center animate-in fade-in-50">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <svg
            className="h-6 w-6 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">
          Chưa có tác giả nào phù hợp với tìm kiếm của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {authors.map((author) => (
        <AuthorCard key={author.id} author={author} />
      ))}
    </div>
  );
}
