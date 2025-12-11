"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBookUpload } from "../hooks/useBookUpload";

export function BookUploadForm() {
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { uploadBook, isUploading, progress, error } = useBookUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !title) {
      return;
    }

    const result = await uploadBook(selectedFile, title);

    if (result.success) {
      setTitle("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.push("/books");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Book Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isUploading}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter book title"
        />
      </div>

      <div>
        <label htmlFor="file" className="block text-sm font-medium mb-1">
          Book File
        </label>
        <input
          ref={fileInputRef}
          id="file"
          type="file"
          onChange={handleFileChange}
          required
          disabled={isUploading}
          accept=".pdf,.epub,.mobi"
          className="w-full"
        />
        {selectedFile && (
          <p className="text-sm text-gray-600 mt-1">
            Selected: {selectedFile.name}
          </p>
        )}
      </div>

      {progress && <div className="text-sm text-blue-600">{progress}</div>}

      {error && <div className="text-sm text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={isUploading || !selectedFile || !title}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isUploading ? "Uploading..." : "Upload Book"}
      </button>
    </form>
  );
}
