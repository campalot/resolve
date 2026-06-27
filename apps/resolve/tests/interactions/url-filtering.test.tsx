import { screen } from "@testing-library/react";
import { renderWithRouter } from "../setup/test-utils";
import AppRoutes from "../../src/routes/AppRoutes";

describe("Interactions URL filtering", () => {
  it("filters interactions based on status query param", async () => {
    renderWithRouter(<AppRoutes />, {
      route: "/w/alpha/interactions?status=in_review",
    });

    // Wait for interaction rows to render
    const rows = await screen.findAllByTestId("interaction-row");

    expect(rows.length).toBeGreaterThan(0);

    // Every rendered row should reflect IN_REVIEW
    rows.forEach((row) => {
      expect(row).toHaveTextContent(/In Review/i);
    });
  });
});

