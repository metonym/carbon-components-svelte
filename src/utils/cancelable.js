// @ts-check

/**
 * Build the payload of a cancelable callback: `detail` plus
 * `preventDefault()` and `defaultPrevented`, as on a DOM event.
 *
 * ```js
 * const payload = cancelable({ trigger });
 * onopenchange?.(payload);
 * if (payload.defaultPrevented) return;
 * ```
 *
 * @template {object} T
 * @param {T} detail
 * @returns {import("./cancelable.js").Cancelable<T>}
 */
export function cancelable(detail) {
  let prevented = false;
  return {
    ...detail,
    preventDefault() {
      prevented = true;
    },
    get defaultPrevented() {
      return prevented;
    },
  };
}
