import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const AUTH_ENDPOINTS_NO_REFRESH = [
  "/auth/login",
  "/auth/register",
  "/auth/current-user",
  "/auth/refresh-token",
  "/auth/logout",
];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isExemptEndpoint = AUTH_ENDPOINTS_NO_REFRESH.some((path) =>
      originalRequest.url?.includes(path),
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isExemptEndpoint
    ) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
