import { axiosClient } from "@/lib/api";
import { handleRequest } from "@/lib/handleApiRequest";
import { ChangePasswordFields } from "@/app/schema/changePasswordSchema";

type MessageResponse = {
  message: string;
};

export async function ChangePasswordRequest(payload: ChangePasswordFields) {
  return handleRequest<MessageResponse>(() =>
    axiosClient.post(`/auth/change-password`, {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    })
  );
}
