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
  const { data: categoriesData } = await getCategories(1, 10);
  const categories = categoriesData ?? [];
  const defaultCategory = categories[0];
  let booksIni: Book[] = [];

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
    } catch {
      booksIni = [];
    }
  }

  return (
    <div className="flex w-full flex-row justify-between md:w-[700px] lg:w-full">
      <BookCategoryClient categories={categories} booksIni={booksIni} />
    </div>
  );
}
