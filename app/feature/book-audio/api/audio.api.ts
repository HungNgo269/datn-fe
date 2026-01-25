import { handleRequest } from "@/lib/handleApiRequest";
import { axiosClient } from "@/lib/api";

export interface ChapterAudioResponse {
  id: number;
  chapterId: number;
  status: string;
  url: string;
  duration: number; // Duration in seconds from API
}

/**
 * Fetch audio URL for a specific chapter
 * @param chapterId - The ID of the chapter
 * @returns Promise with the audio data including URL
 */
export async function getChapterAudio(chapterId: string | number) {
  // Return the URL directly so AudioStreamService can handle the binary stream/redirection
  // validation keys (id, status etc) are mocked as they are not available without a fetch,
  // but AudioStreamService primarily needs the URL.
  return {
    id: 0,
    chapterId: Number(chapterId),
    status: 'success',
    url: `${process.env.NEXT_PUBLIC_API_URL}/audio/chapter/${chapterId}`,
    duration: 0
  };
}
