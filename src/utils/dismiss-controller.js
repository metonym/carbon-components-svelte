// @ts-check

import {
  poolKey,
  registerConsumer,
  unregisterConsumer,
} from "./window-listener-pool.js";

/**
 * @typedef {{ handler: (event: Event) => void }} Consumer
 * @typedef {import("./window-listener-pool.js").Pool} Pool
 */

/**
 * Keyboard listeners register as soon as listening is enabled. Only the
 * pointer listeners need the deferral below, and a key pressed right after
 * opening (Chrome runs queued input before timers) must not be missed.
 */
const IMMEDIATE_TYPES = new Set(["keydown", "keyup"]);

/**
 * `window` listeners while `enabled` is true. Controls with the same
 * `(type, options)` share one listener. `update` swaps handlers in place
 * without re-registering. SSR-safe. The `dismiss` attachment wraps this.
 *
 * @param {import("./dismiss-controller.js").DismissParams} options
 * @returns {import("./dismiss-controller.js").DismissController}
 */
export function createDismiss(options) {
  let specs = normalize(options);
  let enabled = !!options.enabled;
  let immediate = !!options.immediate;
  let destroyed = false;
  let addScheduled = false;

  /**
   * One entry per spec; `null` while a deferred spec waits to register.
   * @type {Array<{ key: string, pool: Pool, consumer: Consumer } | null>}
   */
  let registered = [];

  // Only called with nothing registered: on creation, or after `remove()`.
  function add() {
    if (typeof window === "undefined") return;
    registered = specs.map((spec) =>
      immediate || IMMEDIATE_TYPES.has(spec.type)
        ? registerConsumer(spec)
        : null,
    );
    if (addScheduled || registered.every(Boolean)) return;
    addScheduled = true;
    // Defer registration to the next task (not just a microtask). Enabling
    // synchronously within a click (e.g. a button outside the anchor setting
    // `open` to true) would otherwise register the window listener while
    // that SAME click is still bubbling — heavy synchronous DOM work in the
    // handler (mounting a portal, positioning it) can delay the event's
    // arrival at `window` past any microtask flush, so only a macrotask
    // defer reliably waits for the current dispatch to finish. Re-checks
    // `enabled`/`destroyed` since either may have changed by the time this
    // runs.
    setTimeout(() => {
      addScheduled = false;
      if (destroyed || !enabled) return;
      registered = specs.map(
        (spec, i) => registered[i] ?? registerConsumer(spec),
      );
    });
  }

  function remove() {
    for (const entry of registered) if (entry) unregisterConsumer(entry);
    registered = [];
  }

  if (enabled) add();

  return {
    /** @param {import("./dismiss-controller.js").DismissParams} next */
    update(next) {
      const nextSpecs = normalize(next);
      const nextEnabled = !!next.enabled;
      const sameShape =
        registered.length === nextSpecs.length &&
        nextSpecs.every(
          (s, i) =>
            registered[i] && registered[i].key === poolKey(s.type, s.options),
        );

      if (enabled && nextEnabled && sameShape) {
        nextSpecs.forEach((s, i) => {
          const entry = registered[i];
          if (entry) entry.consumer.handler = s.handler;
        });
        specs = nextSpecs;
        return;
      }

      remove();
      specs = nextSpecs;
      enabled = nextEnabled;
      immediate = !!next.immediate;
      if (enabled) add();
    },
    destroy() {
      destroyed = true;
      remove();
    },
  };
}

/**
 * @param {import("./dismiss-controller.js").DismissParams} options
 * @returns {Array<{ type: string, handler: (event: Event) => void, options: boolean | AddEventListenerOptions | undefined }>}
 */
function normalize(options) {
  if (options.listeners) {
    return options.listeners.map((l) => ({
      type: l.type,
      handler: l.handler,
      options: l.options,
    }));
  }
  const types = Array.isArray(options.type)
    ? options.type
    : options.type == null
      ? []
      : [options.type];
  return types.map((type) => ({
    type,
    handler: /** @type {(event: Event) => void} */ (options.handler),
    options: options.options,
  }));
}
