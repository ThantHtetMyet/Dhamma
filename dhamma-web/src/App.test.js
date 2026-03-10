import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

test("renders sign in page title", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const title = screen.getByRole("heading", { name: /sign in/i });
  expect(title).toBeInTheDocument();
});
