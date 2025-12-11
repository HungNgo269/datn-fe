import { axiosClient } from "@/lib/api";

export async function logout(): Promise<string | null> {
  try {
    const response = await axiosClient.post(`auth/logout`);
    console.log("cheklogout", response);
    // if (!response?.data) {
    //   throw new Error("Đăng nhập thất bại");
    // }
    return "Đăng xuất thành công";
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return null;
  }
}
