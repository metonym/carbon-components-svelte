import { render } from "@testing-library/svelte";
import { flushSync } from "svelte";
import DismissAttachment from "./DismissAttachment.test.svelte";

/** Registration is deferred by a macrotask; flush it before dispatching test events. */
const flush = () => new Promise((resolve) => setTimeout(resolve));

describe("dismiss attachment", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("listens while enabled and stops on unmount", async () => {
    const handler = vi.fn();
    const { unmount } = render(DismissAttachment, { handler });
    await flush();

    window.dispatchEvent(new MouseEvent("click"));
    expect(handler).toHaveBeenCalledTimes(1);

    unmount();
    window.dispatchEvent(new MouseEvent("click"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("swaps a new handler in place without re-registering", async () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(DismissAttachment, { handler: first });
    await flush();
    const added = add.mock.calls.length;

    await rerender({ handler: second });
    flushSync();
    await flush();

    expect(add.mock.calls.length).toBe(added);
    expect(remove).not.toHaveBeenCalled();
    window.dispatchEvent(new MouseEvent("click"));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("adds and removes the listener as `enabled` flips", async () => {
    const handler = vi.fn();
    const { rerender } = render(DismissAttachment, { handler, enabled: false });
    await flush();
    window.dispatchEvent(new MouseEvent("click"));
    expect(handler).not.toHaveBeenCalled();

    await rerender({ enabled: true });
    await flush();
    window.dispatchEvent(new MouseEvent("click"));
    expect(handler).toHaveBeenCalledTimes(1);

    await rerender({ enabled: false });
    await flush();
    window.dispatchEvent(new MouseEvent("click"));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
