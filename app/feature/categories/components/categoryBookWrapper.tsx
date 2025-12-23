import { getBookByCategoryAction } from "../../books/action/books.action";
import { Book } from "../../books/types/books.type";
import { getCategories } from "../actions/categories.action";
import BookCategoryContainer from "./categoryBookContainer";

export default async function CategoryBookWrapper() {
  const { data: categories } = await getCategories(1, 10);

  const defaultCategoryId = categories?.[0]?.id;
  let initialBooks: Book[] = [];

  if (defaultCategoryId) {
    try {
      const res = await getBookByCategoryAction(
        1,
        10,
        "",
        defaultCategoryId,
        ""
      );
      console.log("ers", res);
      initialBooks = res.data;
    } catch (e) {
      console.error("Error fetching initial books", e);
    }
  }

  return (
    <div className="flex flex-row justify-between lg:w-full w-full md:w-[700px]">
      <BookCategoryContainer
        key="category-container"
        categories={categories}
        initialBooks={initialBooks}
      />
    </div>
  );
}
