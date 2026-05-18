import api from "./api";

const unwrapData = (response) => response.data.data;

export const resultService = {
  async create(payload) {
    const response = await api.post("/api/results", payload);
    return unwrapData(response).result;
  },

  async getStudentResults(studentId) {
    const response = await api.get(`/api/results/student/${studentId}`);
    return unwrapData(response).results;
  },

  async getTopStudents() {
    const response = await api.get("/api/results/analytics/top-students");
    return unwrapData(response).students;
  },

  async getAverageGPA() {
    const response = await api.get("/api/results/analytics/average-gpa");
    return unwrapData(response).summary;
  },

  async getSubjectPerformance() {
    const response = await api.get("/api/results/analytics/subject-performance");
    return unwrapData(response).subjects;
  }
};
