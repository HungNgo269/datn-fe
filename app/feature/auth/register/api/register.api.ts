import { axiosClient } from "@/lib/api";
import { RegisterFields } from "@/lib/validation/auth/registerSchema";
import { RegisterResponse } from "../types/register.type";

export async function Register(
  credentials: RegisterFields
): Promise<RegisterResponse | null> {
  try {
    const response = await axiosClient.post<RegisterResponse>(
      `auth/signup`,
      credentials
    );

    if (!response?.data) {
      throw new Error("Đăng nhập thất bại");
    }
    return response.data;
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return null;
  }
}
