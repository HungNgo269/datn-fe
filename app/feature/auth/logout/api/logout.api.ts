import { axiosClient } from "@/lib/api";
import { handleRequest } from "@/lib/handleApiRequest";

export async function logout() {
  return handleRequest(() => axiosClient.post(`auth/logout`));
}
