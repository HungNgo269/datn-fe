import AuthorCard from "./authorCard";
import { AuthorInfo } from "../types/authors.types";

interface AuthorGridProps {
  authors: AuthorInfo[];
}

export default function AuthorGrid({ authors }: AuthorGridProps) {
  if (!authors?.length) {
    return (
      <div className="w-full rounded-xl border border-border/60 bg-card p-10 text-center text-muted-foreground">
        Không có tác giả nào phù hợp với tiêu chí tìm kiếm.
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {authors.map((author) => (
        <AuthorCard key={author.id} author={author} />
      ))}
    </div>
  );
}
