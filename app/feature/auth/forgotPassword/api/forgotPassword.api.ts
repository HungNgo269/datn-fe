import { axiosClient } from "@/lib/api";
import { ForgotPasswordFields } from "@/lib/validation/auth/forgotPasswordSchema";
type ForgotPasswordPayload = ForgotPasswordFields & {
  token: string;
};
export async function ForgotPassword(
  payload: ForgotPasswordPayload
): Promise<string | null> {
  try {
    const response = await axiosClient.post(`auth/forgot-password`, payload);

    if (!response?.data) {
      throw new Error("Đăng nhập thất bại");
    }
    return response.data;
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return null;
  }
}
