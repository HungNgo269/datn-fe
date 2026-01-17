import { getBooksAction } from "../../books/action/books.action";
import { getCategories } from "../actions/categories.action";
import {
  Book,
  BookSortBy,
  GetBooksParams,
  SortOrder,
} from "../../books/types/books.type";
import BookCategoryClient from "./categoryBookContainer";

export default async function CategoryBookWrapper() {
  let categories = [];
  let booksIni: Book[] = [];

  try {
    const { data: categoriesData } = await getCategories(1, 10);
    categories = categoriesData ?? [];
    console.log("CategoryBookWrapper: Fetched categories", categories.length);
  } catch (error) {
    console.error("CategoryBookWrapper: Failed to fetch categories", error);
    categories = [];
  }

  const defaultCategory = categories[0];

  if (defaultCategory?.id) {
    try {
      const params: GetBooksParams = {
        sortBy: BookSortBy.VIEW_COUNT,
        category: defaultCategory.slug,
        limit: 10,
        page: 1,
        sortOrder: SortOrder.DESC,
      };
      const res = await getBooksAction(params);
      booksIni = res.data ?? [];
      console.log("CategoryBookWrapper: Fetched books", booksIni.length);
    } catch (error) {
      console.error("CategoryBookWrapper: Failed to fetch books", error);
      booksIni = [];
    }
  }

  // Always render the component, even with empty data
  return (
    <div className="flex w-full flex-row justify-between md:w-[700px] lg:w-full">
      <BookCategoryClient categories={categories} booksIni={booksIni} />
    </div>
  );
}
