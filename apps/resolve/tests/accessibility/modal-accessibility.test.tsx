import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../setup/test-utils";
import AppRoutes from "../../src/routes/AppRoutes";

describe("Modal accessibility", () => {
  it("opens a confirmation modal with proper accessibility behavior", async () => {
    const user = userEvent.setup();

    renderWithRouter(<AppRoutes />, {
      route: "/w/alpha/interactions?status=draft",
    });

    // Wait for interactions list
    await screen.findByTestId("interaction-list");

    // Find a draft interaction
    const rows = await screen.findAllByTestId("interaction-row");
    const draftRow = rows.find((row) =>
      row.textContent?.toLowerCase().includes("draft"),
    );

    expect(draftRow).toBeTruthy();

    const link = draftRow!.querySelector("a");
    await user.click(link!);

    // Wait for detail page
    await screen.findByText(/overview/i);

    // Open modal
    const submitButton = await screen.findByRole("button", {
      name: /submit/i,
    });

    await user.click(submitButton);

    // Modal should appear
    const dialog = await screen.findByRole("dialog");

    expect(dialog).toHaveAttribute("aria-modal", "true");

    // Confirm button should be focusable
    const confirmButton = within(dialog).getByRole("button", { name: /submit/i });
    confirmButton.focus();
    expect(confirmButton).toHaveFocus();

    // Escape should close modal
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
