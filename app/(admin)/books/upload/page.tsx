import { BookUploadForm } from "@/app/feature/books/components/BookUploadForm";

export default function UploadBookPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upload New Book</h1>
      <BookUploadForm />
    </div>
  );
}
