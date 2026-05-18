import api from "./api";

const unwrapData = (response) => response.data.data;

export const feeService = {
  async create(payload) {
    const response = await api.post("/api/fees", payload);
    return unwrapData(response).fee;
  },

  async getStudentFees(studentId) {
    const response = await api.get(`/api/fees/student/${studentId}`);
    return unwrapData(response).fees;
  },

  async getReceipt(feeId) {
    const response = await api.get(`/api/fees/${feeId}/receipt`);
    return unwrapData(response).receipt;
  },

  async getDueSummary() {
    const response = await api.get("/api/fees/analytics/dues");
    return unwrapData(response).summary;
  }
};
