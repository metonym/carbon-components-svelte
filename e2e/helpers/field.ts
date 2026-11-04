import type { Locator, Page } from "@playwright/test";

/**
 * The field around an element found by its test id. Runes components put
 * rest props, `data-testid` included, on their primary element, such as a
 * Checkbox's `<input>`. This finds the form item around it, or the element
 * itself when the test id is on a wrapper the test rendered.
 */
export function fieldByTestId(page: Page, testId: string): Locator {
  const id = JSON.stringify(testId);
  return page
    .locator(
      `.bx--form-item:has([data-testid=${id}]), :not(input, button)[data-testid=${id}]`,
    )
    .last();
}

/** The overlay of the Modal or ComposedModal whose dialog has the test id. */
export function modalByTestId(page: Page, testId: string): Locator {
  return page.locator(".bx--modal", { has: page.getByTestId(testId) });
}
