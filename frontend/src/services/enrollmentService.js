import api from "./api";

const unwrapData = (response) => response.data.data;

export const enrollmentService = {
  async create(payload) {
    const response = await api.post("/api/enrollments", payload);
    return unwrapData(response).enrollment;
  }
};
