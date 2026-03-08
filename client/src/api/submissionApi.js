import api from "./axios";

export const submitCodeApi = async (data) => {
  const res = await api.post("/submission/submit", data);
  return res.data;
};