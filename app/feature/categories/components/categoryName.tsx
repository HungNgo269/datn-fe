import { getCategoryBySlugAction } from "../actions/categories.action"; // Đảm bảo import đúng action

interface CategoryNameProps {
  currentSlug?: string;
}

export default async function CategoryName({ currentSlug }: CategoryNameProps) {
  if (!currentSlug) {
    return (
      <span className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">
        Tất cả các sách
      </span>
    );
  }

  try {
    const categoryData = await getCategoryBySlugAction(currentSlug);
    const displayName =
      categoryData?.description || categoryData?.name || currentSlug;

    return (
      <div className="mb-2">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold capitalize">
          {displayName}
        </h1>
      </div>
    );
  } catch {
    return <span className="text-xl font-bold capitalize">{currentSlug}</span>;
  }
}
