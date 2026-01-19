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
  return handleRequest<ChapterAudioResponse>(() =>
    axiosClient.get(`/audio/chapter/${chapterId}`)
  );
}
