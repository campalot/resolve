import { screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../setup/test-utils";
import AppRoutes from "../../src/routes/AppRoutes";

describe("Interaction workflow", () => {
  it("creates an activity when submitting a draft interaction", async () => {
    const user = userEvent.setup();

    const { getLocation } = renderWithRouter(<AppRoutes />, {
      route: "/w/alpha/interactions?status=draft",
    });

    // Wait for list to load
    await screen.findByTestId("interaction-list");

    // Locate a Draft interaction
    const rows = await screen.findAllByTestId("interaction-row");

    const draftRow = rows.find((row) =>
      row.textContent?.toLowerCase().includes("draft"),
    );

    expect(draftRow).toBeDefined();

    const link = draftRow!.querySelector("a");
    expect(link).toBeDefined();

    await user.click(link!);

    // Confirm user is on detail page
    await screen.findByText(/overview/i);

    const interactionId = getLocation().pathname.split("/")[4];

    // Click Submit action
    await user.click(await screen.findByRole("button", { name: /submit/i }));

    // Modal should appear
    const dialog = await screen.findByRole("dialog");

    // Submit draft
    const submitBtn = await within(dialog).findByRole("button", {
      name: /submit/i,
    });

    // Use fireEvent for a single, non-simulated click to avoid double-events
    fireEvent.click(submitBtn);

    // After clicking submit in the dialog:
    // Status should update
    await screen.findByTestId("interaction-status");

    expect(screen.getByTestId("interaction-status")).toHaveTextContent(
      /in review/i,
    );

    // Navigate to dashboard
    await user.click(screen.getByRole("link", { name: /activity/i }));

    // Verify new activity exists
    const feed = await screen.findByRole("feed");
    const cards = await within(feed).findAllByRole("article");

    const matchingCard = cards.find((card) => {
      const text = card.textContent?.toLowerCase() ?? "";
      return (
        text.includes(interactionId.toLowerCase()) &&
        text.includes("status changed") &&
        text.includes("in review")
      );
    });

    expect(matchingCard).toBeDefined();
  }, 15000);
});
