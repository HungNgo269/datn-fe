import { axiosClient } from "@/lib/api";
import { LoginFields } from "@/app/schema/loginSchema";
import { LoginResponse } from "../types/login.type";
import { BackendResponse } from "@/app/types/api.types";

export async function Login(credentials: LoginFields) {
  try {
    const response = await axiosClient.post<BackendResponse<LoginResponse>>(
      `auth/login`,
      credentials
    );
    if (!response?.data) {
      throw new Error("Đăng nhập thất bại");
    }
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return null;
  }
}
