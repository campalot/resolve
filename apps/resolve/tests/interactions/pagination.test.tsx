import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../setup/test-utils";
import AppRoutes from "../../src/routes/AppRoutes";

describe("Interactions pagination", () => {
  it("navigates to next page and renders different results", async () => {
    const user = userEvent.setup();

    const { getLocation } = renderWithRouter(<AppRoutes />, {
      route: "/w/alpha/interactions?page=1&pageSize=5",
    });

    // Wait for initial rows
    const firstPageRows = await screen.findAllByTestId("interaction-row");
    expect(firstPageRows.length).toBe(5);

    // Capture first row text to compare later
    const firstRowText = firstPageRows[0].textContent;

    // Click next page button
    const nextButton = screen.getByRole("button", {
      name: /go to next page/i,
    });

    await user.click(nextButton);

    await waitFor(() => {
      expect(getLocation().search).toContain("page=2");
    });

    // Wait for page 2 rows
    await waitFor(async () => {
      const secondPageRows = await screen.findAllByTestId("interaction-row");
  
      expect(secondPageRows.length).toBe(5);

      // Ensure content changed
      expect(secondPageRows[0].textContent).not.toBe(firstRowText);
    });
  });
});
