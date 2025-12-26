import { axiosClient } from "@/lib/api";
import { handleRequest } from "@/lib/handleApiRequest";

export async function ForgotPassword(email: string) {
  return handleRequest<string | null>(() =>
    axiosClient.post(`auth/forgot-password`, email)
  );
}
