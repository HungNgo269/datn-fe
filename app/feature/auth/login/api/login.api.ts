import { axiosClient } from "@/lib/api";
import { LoginFields } from "@/lib/validation/auth/loginSchema";
import { LoginResponse } from "../types/login.type";

export async function Login(
  credentials: LoginFields
): Promise<LoginResponse | null> {
  try {
    const response = await axiosClient.post<LoginResponse>(
      `auth/login`,
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
