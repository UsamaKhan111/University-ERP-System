import api from "./api";

const unwrapData = (response) => response.data.data;

const cleanParams = (params) => {
  return Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => value !== "" && value !== null && value !== undefined)
  );
};

export const courseService = {
  async list(params) {
    const response = await api.get("/api/courses", { params: cleanParams(params) });
    return unwrapData(response);
  },

  async create(payload) {
    const response = await api.post("/api/courses", payload);
    return unwrapData(response).course;
  },

  async getEnrollmentStats() {
    const response = await api.get("/api/courses/analytics/enrollments");
    return unwrapData(response).courses;
  },

  async getTeacherStats() {
    const response = await api.get("/api/courses/analytics/teachers");
    return unwrapData(response).teachers;
  }
};
