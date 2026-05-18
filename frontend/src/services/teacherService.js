import api from "./api";

const unwrapData = (response) => response.data.data;

const cleanParams = (params) => {
  return Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => value !== "" && value !== null && value !== undefined)
  );
};

export const teacherService = {
  async list(params) {
    const response = await api.get("/api/teachers", { params: cleanParams(params) });
    return unwrapData(response);
  },

  async create(payload) {
    const response = await api.post("/api/teachers", cleanParams(payload));
    return unwrapData(response).teacher;
  },

  async update(teacherId, payload) {
    const response = await api.put(`/api/teachers/${teacherId}`, cleanParams(payload));
    return unwrapData(response).teacher;
  },

  async getDashboard() {
    const response = await api.get("/api/teachers/dashboard");
    return unwrapData(response);
  }
};
