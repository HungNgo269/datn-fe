import { getBooksAction } from "../../books/action/books.action";
import { getCategories } from "../actions/categories.action";
import {
  Book,
  BookCardProps,
  BookSortBy,
  GetBooksParams,
  SortOrder,
} from "../../books/types/books.type";
import { mapBooksToCardProps } from "@/lib/mapBooktoBookCard";
import BookCategoryClient from "./categoryBookContainer";

export default async function CategoryBookWrapper() {
  const { data: categories } = await getCategories(1, 10);
  console.log("cate", categories);
  const defaultCategoryId = categories?.[0]?.id;
  let booksIni;
  if (defaultCategoryId) {
    try {
      const params: GetBooksParams = {
        sortBy: BookSortBy.VIEW_COUNT,
        category: categories?.[0]?.slug,
        limit: 10,
        page: 1,
        sortOrder: SortOrder.DESC,
      };
      const res = await getBooksAction(params);
      booksIni = res.data;
    } catch (e) {
      console.error("Error fetching initial books", e);
    }
  }

  return (
    <div className="flex flex-row justify-between lg:w-full w-full md:w-[700px]">
      <BookCategoryClient categories={categories} booksIni={booksIni!} />
    </div>
  );
}
