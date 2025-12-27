import Cookies from "js-cookie";

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
    const accessToken = Cookies.get("accessToken");
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
    return response;
  },
  async (error) => {
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

    return Promise.reject(error);
  }
);
