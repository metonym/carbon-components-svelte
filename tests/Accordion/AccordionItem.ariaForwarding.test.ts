import { render, screen } from "@testing-library/svelte";
import AccordionItemAria from "./AccordionItem.ariaForwarding.test.svelte";

describe("AccordionItem aria forwarding", () => {
  it("names the heading button with a consumer aria-label", () => {
    render(AccordionItemAria, {
      props: { itemProps: { "aria-label": "Consumer label" } },
    });

    const button = screen.getByRole("button", { name: "Consumer label" });
    expect(button).toBe(screen.getByTestId("item"));
    expect(button.closest("li")).not.toHaveAttribute("aria-label");
  });
});
