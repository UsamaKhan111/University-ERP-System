import api from "./api";

const unwrapData = (response) => response.data.data;

const cleanParams = (params) => {
  return Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => value !== "" && value !== null && value !== undefined)
  );
};

export const examService = {
  async list(params) {
    const response = await api.get("/api/exams", { params: cleanParams(params) });
    return unwrapData(response);
  },

  async create(payload) {
    const response = await api.post("/api/exams", payload);
    return unwrapData(response).exam;
  }
};
