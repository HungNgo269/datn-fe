import { getNewBookAction } from "../actions/newBook.action";
import Swipper from "../../../share/components/ui/swipper/swipper";

export default async function SwipperNewBook() {
  const Books = await getNewBookAction(10);
  return (
    <Swipper
      books={Books}
      context="Những đầu sách mới nhất
"
    ></Swipper>
  );
}
