import axios from "axios";

const API = axios.create({
  
  baseURL: (import.meta.env.VITE_API_URL || "https://codevector.onrender.com") + "/api",
  withCredentials: true, // send httpOnly token cookie on every request
});

export default API;