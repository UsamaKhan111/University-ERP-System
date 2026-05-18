const cacheStore = require("../utils/cacheStore");
const getPagination = require("../utils/pagination");

describe("Scalability utilities", () => {
  beforeEach(() => {
    cacheStore.clear();
  });

  it("caps pagination limits for large dataset queries", () => {
    expect(getPagination({ page: "3", limit: "1000" })).toEqual({
      limit: 100,
      page: 3,
      skip: 200
    });
  });

  it("expires cache entries by TTL", async () => {
    cacheStore.set("analytics:test", { value: 1 }, 0.05);
    expect(cacheStore.get("analytics:test")).toEqual({ value: 1 });

    await new Promise((resolve) => {
      setTimeout(resolve, 80);
    });

    expect(cacheStore.get("analytics:test")).toBeNull();
  });
});
