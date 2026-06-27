import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../setup/test-utils";
import AppRoutes from "../../src/routes/AppRoutes";

describe("Pagination accessibility", () => {
  it("renders accessible pagination controls", async () => {
    const user = userEvent.setup();

    const { getLocation } = renderWithRouter(<AppRoutes />, {
      route: "/w/alpha/interactions?page=1&pageSize=5",
    });

    // Wait for interaction list
    await screen.findByTestId("interaction-list");

    // Pagination region should exist
    const pagination = screen.getByRole("navigation", {
      name: /pagination/i,
    });

    expect(pagination).toBeInTheDocument();

    // Previous button should be disabled on page 1
    const prevButton = screen.getByRole("button", {
      name: /go to previous page/i,
    });

    expect(prevButton).toHaveAttribute("aria-disabled", "true");

    // Click next page
    const nextButton = screen.getByRole("button", {
      name: /go to next page/i,
    });

    await user.click(nextButton);

    // URL should update
    expect(getLocation().search).toContain("page=2");

    // Current range indicator
    // This waits for the "quick update" to happen
    const currentRangeSpan = await screen.findByText(
      /6\s*-\s*10/i,
      {},
      { timeout: 5000 },
    );
    expect(currentRangeSpan).toBeInTheDocument();
  });

  it("allows keyboard navigation for pagination", async () => {
    const user = userEvent.setup();

    const { getLocation } = renderWithRouter(<AppRoutes />, {
      route: "/w/alpha/interactions?page=1&pageSize=5",
    });

    await screen.findByTestId("interaction-list");

    const nextButton = screen.getByRole("button", {
      name: /go to next page/i,
    });

    // Tab until focus reaches next button
    await user.tab();
    await user.tab(); // depends on layout

    expect(nextButton).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(getLocation().search).toContain("page=2");
  });

  it("disables previous button on first page", async () => {
    renderWithRouter(<AppRoutes />, {
      route: "/w/alpha/interactions?page=1&pageSize=5",
    });

    await screen.findByTestId("interaction-list");

    const prevButton = screen.getByRole("button", {
      name: /go to previous page/i,
    });

    expect(prevButton).toHaveAttribute("aria-disabled", "true");
  });
});
