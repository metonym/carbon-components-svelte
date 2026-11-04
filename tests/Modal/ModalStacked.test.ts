import { render, screen } from "@testing-library/svelte";
import { user } from "../utils/user";
import ModalStacked from "./ModalStacked.test.svelte";

/** The overlay root of the modal whose dialog carries `testId`. */
const overlay = (testId: string) => screen.getByTestId(testId).closest(".bx--modal");

describe("Stacked modals", () => {
  it("closes only the topmost modal when Escape is pressed", async () => {
    render(ModalStacked);

    await user.click(screen.getByTestId("launch-sibling-modal"));
    await user.click(screen.getByTestId("launch-child-modal"));

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(overlay("sibling-modal")).toHaveClass("is-visible");
    expect(overlay("child-modal")).toHaveClass("is-visible");

    await user.keyboard("{Escape}");

    expect(overlay("modal")).toHaveClass("is-visible");
    expect(overlay("sibling-modal")).toHaveClass("is-visible");
    expect(overlay("child-modal")).not.toHaveClass("is-visible");
  });

  it("keeps Tab inside a DOM-nested child modal", async () => {
    render(ModalStacked);

    await user.click(screen.getByTestId("launch-sibling-modal"));
    await user.click(screen.getByTestId("launch-child-modal"));
    const child = screen.getByTestId("child-modal");
    child.querySelector<HTMLElement>(".bx--modal-close")?.focus();

    await user.keyboard("{Tab}");

    expect(child).toContainElement(document.activeElement as HTMLElement);
  });
});
