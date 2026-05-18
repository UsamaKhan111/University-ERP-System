import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AuthProvider } from "../context/AuthContext";
import AppRoutes from "./AppRoutes";

const renderRoutes = (initialPath = "/") => {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthProvider>
  );
};

describe("App routes and auth guards", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("redirects protected routes to login without a token", async () => {
    renderRoutes("/");

    expect(await screen.findByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  it("renders protected dashboard when a token is stored", async () => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        fullName: "Student User",
        role: "student"
      })
    );

    renderRoutes("/");

    expect(await screen.findByRole("heading", { name: "University ERP Overview" })).toBeInTheDocument();
    expect(screen.getByText("Student User")).toBeInTheDocument();
  });
});
