import api from "./api";

const unwrapData = (response) => response.data.data;

const cleanParams = (params) => {
  return Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => value !== "" && value !== null && value !== undefined)
  );
};

export const studentService = {
  async list(params) {
    const response = await api.get("/api/students", { params: cleanParams(params) });
    return unwrapData(response);
  },

  async getById(studentId) {
    const response = await api.get(`/api/students/${studentId}`);
    return unwrapData(response).student;
  },

  async getMe() {
    const response = await api.get("/api/students/me");
    return unwrapData(response).student;
  },

  async getDepartmentStats() {
    const response = await api.get("/api/students/analytics/departments");
    return unwrapData(response).departments;
  },

  async getSemesterStats() {
    const response = await api.get("/api/students/analytics/semesters");
    return unwrapData(response).semesters;
  }
};
