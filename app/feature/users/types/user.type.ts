export interface User {
  id: number;
  email: string;
  username: string;
  avatar: string | null;
  subscriptionPlan: string;
  status: string;
  lastLoginAt?: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  roles: string[];
}
