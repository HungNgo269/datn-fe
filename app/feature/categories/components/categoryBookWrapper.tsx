import { getCategories } from "../actions/categories.action";
import BookCategoryContainer from "./categoryBookContainer";

export default async function CategoryBookWrapper() {
  const result = await getCategories(1, 10);

  if (!result.success) {
    console.error(result.error);
    return <></>;
  }

  console.log("Categories loaded:", result.data.length);

  return (
    <div className="flex flex-row justify-between lg:w-full w-full md:w-[700px]">
      <BookCategoryContainer
        key="category-container"
        categories={result.data}
      />
    </div>
  );
}
