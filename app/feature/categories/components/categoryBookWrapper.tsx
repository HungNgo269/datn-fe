import { getBooksAction } from "../../books/action/books.action";
import { getCategories } from "../actions/categories.action";
import {
  Book,
  BookSortBy,
  GetBooksParams,
  SortOrder,
} from "../../books/types/books.type";
import BookCategoryClient from "./categoryBookContainer";
import { Category } from "../types/listCategories";

export default async function CategoryBookWrapper() {
  let categories: Category[] = [];
  let booksIni: Book[] = [];

  try {
    const { data: categoriesData } = await getCategories(1, 10);
    categories = categoriesData ?? [];
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
    } catch (error) {
      console.error("CategoryBookWrapper: Failed to fetch books", error);
      booksIni = [];
    }
  }
  return (
    <div className="flex w-full flex-row justify-between md:w-[700px] lg:w-full">
      <BookCategoryClient categories={categories} booksIni={booksIni} />
    </div>
  );
}
