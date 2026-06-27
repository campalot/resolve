import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../setup/test-utils";
import AppRoutes from "../../src/routes/AppRoutes";

describe("Interaction workflow (keyboard + modal)", () => {
  it("allows submitting a draft interaction using keyboard only", async () => {
    const user = userEvent.setup();

    renderWithRouter(<AppRoutes />, {
      route: "/w/alpha/interactions?status=draft",
    });

    // Wait for list to render
    await screen.findByTestId("interaction-list");

    const rows = await screen.findAllByTestId("interaction-row");
    const draftRow = rows.find((row) =>
      row.textContent?.toLowerCase().includes("draft"),
    );

    expect(draftRow).toBeTruthy();

    const link = draftRow!.querySelector("a");
    expect(link).toBeTruthy();

    await user.click(link!);

    await screen.findByText(/overview/i);

    // Focus submit button
    const submitButton = await screen.findByRole("button", {
      name: /submit/i,
    });

    submitButton.focus();
    expect(submitButton).toHaveFocus();

    // Activate via keyboard
    await user.keyboard("{Enter}");

    // Modal should appear
    const dialog = await screen.findByRole("dialog");
    const confirmButton = await within(dialog).findByRole("button", {
      name: /submit/i,
    });

    expect(confirmButton).toBeInTheDocument();

    confirmButton.focus();
    expect(confirmButton).toHaveFocus();

    // Confirm via keyboard
    await user.keyboard("{Enter}");

    // Wait for modal to disappear
    await waitFor(() => {
      expect(confirmButton).not.toBeInTheDocument();
    });

    // Status should now reflect In Review
    const statusSection = screen.getByTestId("interaction-status");

    await waitFor(() => {
      expect(statusSection).toHaveTextContent(/in review/i);
    });
  });
});
