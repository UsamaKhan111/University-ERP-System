import api from "./api";

const unwrapData = (response) => response.data.data;

export const analyticsService = {
  async getDashboard() {
    const response = await api.get("/api/analytics/dashboard");
    return unwrapData(response);
  }
};
