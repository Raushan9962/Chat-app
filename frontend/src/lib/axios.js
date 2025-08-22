// src/lib/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:8080/api": "/api",
  withCredentials: true, // if your backend uses cookies
});

export default axiosInstance; // ✅ default export
