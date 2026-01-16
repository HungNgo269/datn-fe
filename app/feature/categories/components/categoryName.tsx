import { getCategoryBySlugAction } from "../actions/categories.action";

interface CategoryNameProps {
  currentSlug?: string;
}

export default async function CategoryName({ currentSlug }: CategoryNameProps) {
  if (!currentSlug) {
    return (
      <span className="mb-2 text-lg font-semibold sm:text-xl md:text-2xl">
        Tất cả các sách
      </span>
    );
  }

  try {
    const categoryData = await getCategoryBySlugAction(currentSlug);
    const displayName =
      categoryData?.description || categoryData?.name || currentSlug;

    return (
      <div className="mb-2">
        <h1 className="text-lg font-semibold capitalize sm:text-xl md:text-2xl">
          {displayName}
        </h1>
      </div>
    );
  } catch {
    return <span className="text-xl font-bold capitalize">{currentSlug}</span>;
  }
}
