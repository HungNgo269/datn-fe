import type { ReactNode } from "react";

interface ResultSectionProps {
  title: string;
  count: number;
  children: ReactNode;
  emptyMessage: string;
  hideIfEmpty?: boolean;
  id?: string;
}

export function ResultSection({
  title,
  count,
  children,
  emptyMessage,
  hideIfEmpty = false,
  id,
}: ResultSectionProps) {
  if (count === 0 && hideIfEmpty) return null;

  return (
    <section id={id} className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          {title} &nbsp;
          <span className="text-badge-foreground text-sm">Tất cả {count} </span>
        </h2>
      </div>
      {count > 0 ? (
        children
      ) : (
        <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>
      )}
    </section>
  );
}
