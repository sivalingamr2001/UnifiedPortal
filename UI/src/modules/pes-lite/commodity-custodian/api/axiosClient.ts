import axios from "axios"

const baseURL = import.meta.env.DEV
  ? import.meta.env.VITE_API_BASE_URL
  : "/commodity/api"

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API call error:", error.response?.data || error.message)
    return Promise.reject(error)
  }
)
