import { axiosClient } from "@/lib/api";
import { LoginFields } from "@/app/schema/loginSchema";
import { handleRequest } from "@/lib/handleApiRequest";
import { LoginResponse } from "../types/login.type";

export async function Login(credentials: LoginFields) {
  return handleRequest<LoginResponse>(() =>
    axiosClient.post(`auth/login`, credentials)
  );
}
