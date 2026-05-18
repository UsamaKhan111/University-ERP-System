const request = require("supertest");

const app = require("../app");

describe("GET /", () => {
  it("returns API status", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "University ERP API Running"
    });
  });
});
