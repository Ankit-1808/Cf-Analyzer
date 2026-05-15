import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 20000
});

export async function analyzeHandle(handle, options = {}) {
  const params = {};

  if (options.refresh) {
    params.refresh = "true";
  }

  const response = await api.get(`/api/analyze/${encodeURIComponent(handle)}`, {
    params
  });

  return response.data;
}

export default api;
