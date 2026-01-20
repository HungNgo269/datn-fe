import Cookies from "js-cookie";

import axios, { AxiosError, AxiosResponse } from "axios";
import { useAuthStore } from "@/app/store/useAuthStore";

const TOKEN_ERROR_MESSAGES = [
  "invalid or missing token",
  "invalid token",
  "missing token",
  "token expired",
];

const extractErrorMessage = (data: unknown): string => {
  if (!data) {
    return "";
  }

  if (typeof data === "string") {
    return data;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message?: string }).message === "string"
  ) {
    return (data as { message?: string }).message as string;
  }

  return "";
};

const shouldForceLogout = (error: AxiosError): boolean => {
  const { response } = error;
  if (!response || response.status !== 401) {
    return false;
  }

  const message = extractErrorMessage(response.data).toLowerCase();
  if (!message) {
    return false;
  }

  return TOKEN_ERROR_MESSAGES.some((tokenMessage) =>
    message.includes(tokenMessage)
  );
};

const logoutDueToInvalidToken = () => {
  try {
    Cookies.remove("accessToken");
  } catch (cookieError) {
    console.error("Failed to remove access token cookie", cookieError);
  }

  try {
    useAuthStore.getState().clearUser();
  } catch (storeError) {
    console.error(
      "Failed to clear auth store during forced logout",
      storeError
    );
  }
};

export const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  headers: { "Content-Type": "application/json" },
});
axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
// Response interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    if (shouldForceLogout(error)) {
      logoutDueToInvalidToken();
    }
    return Promise.reject(error);
  }
);
