import { User } from "@/app/feature/users/types/user.type";

export type RegisterResponse = {
  accessToken: string;
  user: User;
};
