import { User } from "@/app/feature/users/types/user.type";

export type LoginResponse = {
  accessToken: string;
  user: User;
};
