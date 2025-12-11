import { useTokenStore } from "@/app/store/useTokenStore";
import axios, {
  AxiosResponse, //   AxiosResponse, //   AxiosError, // , {
  //   InternalAxiosRequestConfig,
  // }
} from "axios";

export const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
  headers: { "Content-Type": "application/json" },
  // withCredentials: true,
});
axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = useTokenStore.getState().token;
    console.log("acc", accessToken);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
// let isRefreshing = false;

// interface QueueItem {
//   resolve: (token: string) => void;
//   reject: (error: unknown) => void;
// }

// let failedQueue: QueueItem[] = [];

// const processQueue = (
//   error: unknown = null,
//   token: string | null = null
// ): void => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token!);
//     }
//   });
//   failedQueue = [];
// };

// Response interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("res", response);
    if (response.data?.success && response.data?.data) {
      return response.data;
    }
    return response.data;
  }
  //   async (error: AxiosError) => {
  //     const originalRequest = error.config as InternalAxiosRequestConfig & {
  //       _retry?: boolean;
  //     };

  //     if (
  //       originalRequest.url?.includes("/auth/login") ||
  //       originalRequest.url?.includes("/auth/signup") ||
  //       originalRequest.url?.includes("/auth/logout") ||
  //       originalRequest.url?.includes("/auth/forgot-password") ||
  //       originalRequest.url?.includes("/auth/change-password") ||
  //       originalRequest.url?.includes("/auth/refresh")
  //     ) {
  //       return Promise.reject(error);
  //     }
  //     if (error.response?.status === 401 && !originalRequest._retry) {
  //       if (isRefreshing) {
  //         return new Promise((resolve, reject) => {
  //           failedQueue.push({
  //             resolve: (token: string) => {
  //               if (originalRequest.headers) {
  //                 originalRequest.headers.Authorization = `Bearer ${token}`;
  //               }
  //               resolve(axiosClient(originalRequest));
  //             },
  //             reject: (err: unknown) => {
  //               reject(err);
  //             },
  //           });
  //         });
  //       }

  //       originalRequest._retry = true;
  //       isRefreshing = true;

  //       try {
  //         const newAccessToken = await authApi.refreshToken();

  //         useTokenStore.getState().setAccessToken(newAccessToken);
  //         processQueue(null, newAccessToken);

  //         if (originalRequest.headers) {
  //           originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
  //         }

  //         return axiosClient(originalRequest);
  //       } catch (refreshError) {
  //         processQueue(refreshError, null);
  //         // Logout logic here
  //         // Example: useAuthStore.getState().logout();
  //         return Promise.reject(refreshError);
  //       } finally {
  //         isRefreshing = false;
  //       }
  //     }

  //     return Promise.reject(error);
  //   }
);
