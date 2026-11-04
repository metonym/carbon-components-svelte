import { createDismissibleNotification } from "../../src/utils/dismissible-notification.js";

describe("createDismissibleNotification", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("close() asks requestClose and sets open false when it agrees", () => {
    const dispatch = vi.fn(() => true);
    const setOpen = vi.fn();
    const notification = createDismissibleNotification({
      requestClose: dispatch,
      getPauseOnHover: () => false,
      setOpen,
    });

    notification.close("close-button");

    expect(dispatch).toHaveBeenCalledWith("close-button");
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("close() does not set open when requestClose declines", () => {
    const dispatch = vi.fn(() => false);
    const setOpen = vi.fn();
    const notification = createDismissibleNotification({
      requestClose: dispatch,
      getPauseOnHover: () => false,
      setOpen,
    });

    notification.close("close-button");

    expect(setOpen).not.toHaveBeenCalled();
  });

  it("close() passes its trigger to requestClose", () => {
    const dispatch = vi.fn(() => true);
    const notification = createDismissibleNotification({
      requestClose: dispatch,
      getPauseOnHover: () => false,
      setOpen: vi.fn(),
    });

    notification.close("timeout");
    expect(dispatch).toHaveBeenCalledWith("timeout");

    notification.close("escape-key");
    expect(dispatch).toHaveBeenLastCalledWith("escape-key");
  });

  it("sync() auto-closes with the timeout trigger after the given delay", () => {
    const dispatch = vi.fn(() => true);
    const setOpen = vi.fn();
    const notification = createDismissibleNotification({
      requestClose: dispatch,
      getPauseOnHover: () => false,
      setOpen,
    });

    notification.sync(true, 100);
    expect(dispatch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);

    expect(dispatch).toHaveBeenCalledWith("timeout");
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("sync() ignores timeout when the notification has an action", () => {
    const dispatch = vi.fn(() => true);
    const notification = createDismissibleNotification({
      requestClose: dispatch,
      getPauseOnHover: () => false,
      setOpen: vi.fn(),
    });

    notification.sync(true, 100, true);
    vi.advanceTimersByTime(1000);
    expect(dispatch).not.toHaveBeenCalled();

    notification.sync(true, 100, false);
    vi.advanceTimersByTime(100);
    expect(dispatch).toHaveBeenCalledWith("timeout");
  });

  it("sync() does not schedule a close when open is false", () => {
    const dispatch = vi.fn(() => true);
    const notification = createDismissibleNotification({
      requestClose: dispatch,
      getPauseOnHover: () => false,
      setOpen: vi.fn(),
    });

    notification.sync(false, 100);
    vi.advanceTimersByTime(1000);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("dispose() cancels a pending sync() timeout", () => {
    const dispatch = vi.fn(() => true);
    const notification = createDismissibleNotification({
      requestClose: dispatch,
      getPauseOnHover: () => false,
      setOpen: vi.fn(),
    });

    notification.sync(true, 100);
    notification.dispose();
    vi.advanceTimersByTime(100);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("handleMouseenter pauses and handleMouseleave resumes when pauseOnHover is true", () => {
    const dispatch = vi.fn(() => true);
    const notification = createDismissibleNotification({
      requestClose: dispatch,
      getPauseOnHover: () => true,
      setOpen: vi.fn(),
    });

    notification.sync(true, 100);
    vi.advanceTimersByTime(50);

    const root = document.createElement("div");
    notification.handleMouseenter();

    vi.advanceTimersByTime(1000);
    expect(dispatch).not.toHaveBeenCalled();

    const leaveEvent = new MouseEvent("mouseleave", {
      relatedTarget: document.body,
    });
    Object.defineProperty(leaveEvent, "currentTarget", { value: root });
    notification.handleMouseleave(leaveEvent);

    vi.advanceTimersByTime(50);
    expect(dispatch).toHaveBeenCalledWith("timeout");
  });

  it("close() leaves focus alone when a close listener moved it outside", () => {
    const before = document.createElement("button");
    const root = document.createElement("div");
    const inside = document.createElement("button");
    const elsewhere = document.createElement("input");
    root.append(inside);
    document.body.append(before, root, elsewhere);

    const notification = createDismissibleNotification({
      requestClose: vi.fn(() => {
        elsewhere.focus();
        return true;
      }),
      getPauseOnHover: () => false,
      setOpen: vi.fn(),
    });
    root.addEventListener("focusin", notification.handleFocusIn);
    before.focus();
    inside.focus();

    notification.close("close-button");

    expect(document.activeElement).toBe(elsewhere);
    document.body.innerHTML = "";
  });

  it.each([
    ["the page body", () => null],
    ["another element", (other: HTMLElement) => other],
  ])(
    "a timeout leaves focus alone after focus left for %s",
    async (_, next) => {
      const before = document.createElement("button");
      const root = document.createElement("div");
      const inside = document.createElement("button");
      const other = document.createElement("button");
      root.append(inside);
      document.body.append(before, root, other);

      const notification = createDismissibleNotification({
        requestClose: vi.fn(() => true),
        getPauseOnHover: () => false,
        setOpen: vi.fn(),
      });
      root.addEventListener("focusin", notification.handleFocusIn);
      root.addEventListener("focusout", notification.handleFocusOut);
      notification.sync(true, 100);
      before.focus();
      inside.focus();

      const target = next(other);
      if (target) target.focus();
      else inside.blur();
      await Promise.resolve();
      // Focus later drops to the body, as when the focused element goes away.
      other.blur();
      expect(document.activeElement).toBe(document.body);

      vi.advanceTimersByTime(100);

      expect(document.activeElement).toBe(document.body);
      document.body.innerHTML = "";
    },
  );

  it("a timeout still returns focus that stayed inside", () => {
    const before = document.createElement("button");
    const root = document.createElement("div");
    const inside = document.createElement("button");
    root.append(inside);
    document.body.append(before, root);

    const notification = createDismissibleNotification({
      requestClose: vi.fn(() => true),
      getPauseOnHover: () => false,
      setOpen: vi.fn(),
    });
    root.addEventListener("focusin", notification.handleFocusIn);
    root.addEventListener("focusout", notification.handleFocusOut);
    notification.sync(true, 100);
    before.focus();
    inside.focus();

    vi.advanceTimersByTime(100);

    expect(document.activeElement).toBe(before);
    document.body.innerHTML = "";
  });
});
