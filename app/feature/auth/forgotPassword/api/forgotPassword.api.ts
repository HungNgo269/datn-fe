import { axiosClient } from "@/lib/api";
import { handleRequest } from "@/lib/handleApiRequest";
import { ForgotPasswordFields } from "@/app/schema/forgotPasswordSchema";

type MessageResponse = {
  message: string;
};

export async function ForgotPassword(payload: ForgotPasswordFields) {
  return handleRequest<MessageResponse>(() =>
    axiosClient.post(`/auth/forgot-password`, payload)
  );
}
