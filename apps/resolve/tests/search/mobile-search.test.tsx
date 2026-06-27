import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../setup/test-utils";
import AppRoutes from "../../src/routes/AppRoutes";

describe("Mobile Search", () => {
  it("updates URL, renders results, and navigates on selection", async () => {
    const user = userEvent.setup();

    const { getLocation } = renderWithRouter(<AppRoutes />, {
      route: "/w/alpha/search",
    });

    // Ensure search input is present
    const input = await screen.findByPlaceholderText(/search/i);

    // Type a query
    await user.type(input, "ter");

    // Wait for debounce and URL update
    await waitFor(() => {
      expect(getLocation().search).toContain("q=ter");
    });

    // Wait for results to render
    const list = await screen.findByRole("list");

    const buttons = await within(list).findAllByRole("button");

    expect(buttons.length).toBeGreaterThan(0);

    const firstResult = buttons[0];
    const firstResultLabel = within(firstResult).getByTestId("search-result-label");
    const resultText = firstResultLabel.textContent;

    // Click first result
    await user.click(firstResult);

    // After click, should navigate away from /search
    await waitFor(() => {
      expect(getLocation().pathname).not.toEqual("/search");
    });

    // Confirm navigation happened to a workspace route
    expect(getLocation().pathname).toMatch(/^\/w\/(alpha|beta)\//);

    // Confirm target page reflects selected result
    expect(await screen.findByText(resultText!)).toBeInTheDocument();
  });
});
