import axios from "axios";

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isLocalhost) {
      if (envUrl && envUrl.startsWith("https://")) {
        return envUrl;
      }
      return "http://localhost:8000/api/v1";
    }

    if (!envUrl || !envUrl.startsWith("https://")) {
      return `http://${window.location.hostname}:8000/api/v1`;
    }
  }

  return envUrl || "http://localhost:8000/api/v1";
};

export const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const noRefreshEndpoints = [
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
    const isExemptEndpoint = noRefreshEndpoints.some((path) =>
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
          `${API_BASE_URL}/auth/refresh-token`,
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
