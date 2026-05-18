import api from "./api";

const unwrapData = (response) => response.data.data;

const cleanParams = (params) => {
  return Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => value !== "" && value !== null && value !== undefined)
  );
};

export const attendanceService = {
  async mark(payload) {
    const response = await api.post("/api/attendance", payload);
    return unwrapData(response).attendance;
  },

  async getStudentAttendance(studentId, params) {
    const response = await api.get(`/api/attendance/student/${studentId}`, { params: cleanParams(params) });
    return unwrapData(response);
  },

  async getMonthly(params) {
    const response = await api.get("/api/attendance/analytics/monthly", { params: cleanParams(params) });
    return unwrapData(response).monthly;
  },

  async getPercentages(params) {
    const response = await api.get("/api/attendance/analytics/percentages", { params: cleanParams(params) });
    return unwrapData(response).percentages;
  },

  async getDefaulters(params) {
    const response = await api.get("/api/attendance/analytics/defaulters", { params: cleanParams(params) });
    return unwrapData(response).defaulters;
  }
};
