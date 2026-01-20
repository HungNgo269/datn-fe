import { axiosClient } from "@/lib/api";
import { handleRequest } from "@/lib/handleApiRequest";

type ResetPasswordPayload = {
  token: string;
  newPassword: string;
};

type MessageResponse = {
  message: string;
};

export async function ResetPassword(payload: ResetPasswordPayload) {
  return handleRequest<MessageResponse>(() =>
    axiosClient.post(`/auth/reset-password`, payload)
  );
}
