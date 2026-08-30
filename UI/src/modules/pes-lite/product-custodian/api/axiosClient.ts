import axios from "axios"

const baseURL = ""

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
