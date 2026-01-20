import { axiosClient } from "@/lib/api";
import { RegisterFields } from "@/app/schema/registerSchema";
import { RegisterResponse } from "../types/register.type";
import { handleRequest } from "@/lib/handleApiRequest";

export async function Register(credentials: RegisterFields) {
  return handleRequest<RegisterResponse>(() =>
    axiosClient.post(`auth/signup`, credentials)
  );
}
