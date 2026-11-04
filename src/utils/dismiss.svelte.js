// @ts-check

import { createDismiss } from "./dismiss-controller.js";

/**
 * Attachment: `window` listeners while `enabled` is true. Controls with the
 * same `(type, options)` share one listener. SSR-safe.
 *
 * Pass a getter. The listeners register once, and later values update them
 * in place: a new `handler` swaps in without re-registering, and only a
 * change to `enabled`, `type` or `options` adds or removes listeners.
 *
 * ```svelte
 * <div {@attach dismiss(() => ({ enabled: open, type: "click", handler: close }))}>
 * ```
 *
 * @param {() => import("./dismiss-controller.js").DismissParams} getOptions
 * @returns {import("svelte/attachments").Attachment}
 */
export function dismiss(getOptions) {
  return () => {
    /** @type {undefined | import("./dismiss-controller.js").DismissController} */
    let controller;
    $effect(() => {
      const options = getOptions();
      if (controller) controller.update(options);
      else controller = createDismiss(options);
    });
    return () => controller?.destroy();
  };
}
