import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../setup/test-utils";
import AppRoutes from "../../src/routes/AppRoutes";

describe("Interactions pagination", () => {
  it("scopes dashboard activity to workspace", async () => {
    const user = userEvent.setup();
    const initialPath = "/w/alpha/dashboard";
    const { getLocation } = renderWithRouter(<AppRoutes />, {
      route: initialPath,
    });

    // 1. Confirm user started at Alpha
    expect(getLocation().pathname).toBe(initialPath);

    await screen.findAllByRole("article", {}, { timeout: 10000 });

    // 2. Open Switcher and find the "Other" option
    await user.click(screen.getByRole("button", { name: /workspace/i }));
    const options = screen.getAllByRole("menuitem");
    const nextWorkspace = options.find(
      (opt) =>
        opt.textContent && !opt.textContent.toLowerCase().includes("alpha"),
    );

    // Use the text from the button found (e.g., "B Beta Workspace")
    const targetText = nextWorkspace?.textContent?.trim() || "";
    // Extract the slug (e.g., "beta") from the text
    const expectedSlug = targetText.toLowerCase().split(" ")[1]; // Takes "beta" from "B Beta Workspace"

    // 3. Perform the switch
    await user.click(nextWorkspace!);

    // 4. THE PROOF: The URL matches the slug from the button clicked
    const newPath = getLocation()?.pathname || "";
    expect(newPath).toContain(`/w/${expectedSlug}/`);
    expect(newPath).not.toBe(initialPath);

    // 5. DATA PROOF: Verify the Apollo cache actually swapped the data
    await waitFor(() => {
      const cards = screen.getAllByRole("article");
      // Ensure the card content now reflects the new workspace prefix (e.g., "beta_")
      expect(cards[0]).toHaveTextContent(new RegExp(`${expectedSlug}_`, "i"));
    });
  }, 15000);
});
