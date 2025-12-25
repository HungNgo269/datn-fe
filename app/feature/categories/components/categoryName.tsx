import { getCategoryBySlugAction } from "../actions/categories.action"; // Đảm bảo import đúng action

interface CategoryNameProps {
  currentSlug?: string;
}

export default async function CategoryName({ currentSlug }: CategoryNameProps) {
  // Nếu không có slug, hiển thị title mặc định
  if (!currentSlug) {
    return (
      <span className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">
        All Books
      </span>
    );
  }

  // Fetch thông tin category để lấy tên hiển thị đẹp (nếu slug != tên)
  // Lưu ý: Cần try/catch hoặc handle null nếu slug sai
  try {
    const categoryData = await getCategoryBySlugAction(currentSlug);
    // Giả sử API trả về { name: "...", description: "..." }
    const displayName =
      categoryData?.description || categoryData?.name || currentSlug;

    return (
      <div className="mb-2">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold capitalize">
          {displayName}
        </h1>
      </div>
    );
  } catch (error) {
    return <span className="text-xl font-bold capitalize">{currentSlug}</span>;
  }
}
