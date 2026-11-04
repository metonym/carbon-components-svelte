<script>
  /**
   * @restProps {ul}
   */
  let {
    /**
     * Specify the current step index.
     * Ignored when `currentId` is set. An index with no step marks none
     * current.
     */
    currentIndex = $bindable(0),

    /**
     * Specify the current step by id.
     * When set, takes precedence over `currentIndex` and stays on the same
     * logical step as steps are added or removed. Pair with a stable `id` on
     * each `ProgressStep`.
     * @type {string | undefined}
     */
    currentId = $bindable(undefined),

    /** Set to `true` to use the vertical variant */
    vertical = false,

    /** Set to `true` to specify whether the progress steps should be split equally in size in the div */
    spaceEqually = false,

    /** Set to `true` to prevent `currentIndex` from updating */
    preventChangeOnClick = false,

    /**
     * Specify the assistive text appended to a complete or invalid step's name.
     * @type {(status: "complete" | "invalid") => string}
     */
    statusText = (status) => status,

    /**
     * Called when the user makes a complete step current by clicking it.
     * Not called when `currentIndex` or `currentId` is set from outside, or
     * while `preventChangeOnClick` is set.
     * @type {((detail: { index: number; id: string }) => void) | undefined}
     */
    oncurrentchange = undefined,

    /**
     * The `ProgressStep`s.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import { onMount, untrack } from "svelte";
  import { hasModifierKey } from "../utils/has-modifier-key.js";
  import {
    getLayoutDirection,
    resolveLayoutDirection,
  } from "../utils/layout-direction.js";
  import { observeDomOrder } from "../utils/observe-dom-order.js";
  import { resolveIdSelection } from "../utils/resolve-id-selection.js";
  import { rovingFocus } from "../utils/roving-focus.js";
  import { syncDomOrder } from "../utils/sync-dom-order.js";
  import { setProgressIndicator } from "./progress-indicator-context.js";

  const layoutDirection = getLayoutDirection();

  /** @type {null | HTMLUListElement} */
  let listRef = $state(null);

  // Steps register while they initialize, in render order, so the server
  // and the first render know them. Each change replaces the array.
  /** @type {ReadonlyArray<import("./progress-indicator-context.js").StepEntry>} */
  let steps = $state.raw([]);

  // A step added after mount (e.g. by an `{#if}`) registers last, wherever
  // it renders; the first render registers in document order.
  let needsDomSync = false;
  let mounted = false;

  // The context reads these while steps register; the server memoizes a
  // `$derived` on its first read, so they compute fresh.
  function findCurrentIndex() {
    if (currentId !== undefined) {
      return steps.findIndex((step) => step.id === currentId);
    }
    return currentIndex >= 0 && currentIndex < steps.length ? currentIndex : -1;
  }

  // Keep `currentId` on a registered step when its step goes away: the step
  // that took its place, or the last.
  $effect.pre(() => {
    const id = currentId;
    if (id === undefined || steps.length === 0) return;
    untrack(() => {
      const resolved = resolveIdSelection({
        items: steps,
        selectedId: id,
        currentIndex,
      });
      if (!resolved) return;
      if (currentIndex !== resolved.index) currentIndex = resolved.index;
      if (currentId !== resolved.id) currentId = resolved.id;
    });
  });

  /** @param {ReadonlyArray<{ id: string }>} a @param {ReadonlyArray<{ id: string }>} b */
  const sameOrder = (a, b) =>
    a.length === b.length && a.every((item, i) => item.id === b[i].id);

  function syncOrder() {
    if (!listRef) return;
    const next = syncDomOrder({
      root: listRef,
      selector: ".bx--progress-step",
      items: steps,
    }).map(({ index, ...step }) => step);
    if (!sameOrder(next, steps)) steps = next;
  }

  $effect(() => {
    steps;
    listRef;
    untrack(() => {
      if (!needsDomSync) return;
      needsDomSync = false;
      syncOrder();
    });
  });

  onMount(() => {
    mounted = true;
    // A keyed reorder moves steps without re-registering them.
    return observeDomOrder(/** @type {HTMLUListElement} */ (listRef), {
      selector: ".bx--progress-step",
      getItems: () => steps,
      onReorder: syncOrder,
    });
  });

  setProgressIndicator({
    get currentStepId() {
      return steps[findCurrentIndex()]?.id ?? null;
    },
    get preventChangeOnClick() {
      return preventChangeOnClick;
    },
    statusText: (status) => statusText(status),
    add(entry) {
      if (steps.some((step) => step.id === entry.id)) return;
      steps = [...steps, entry];
      if (mounted) needsDomSync = true;
    },
    patch(id, patch) {
      const index = steps.findIndex((step) => step.id === id);
      if (index === -1) return;
      const current = steps[index];
      if (
        Object.entries(patch).every(
          ([key, value]) =>
            current[/** @type {keyof typeof current} */ (key)] === value,
        )
      ) {
        return;
      }
      const next = [...steps];
      next[index] = { ...current, ...patch };
      steps = next;
    },
    remove(id) {
      steps = steps.filter((step) => step.id !== id);
    },
    change(id) {
      if (preventChangeOnClick) return;
      const index = steps.findIndex((step) => step.id === id);
      if (index === -1) return;
      if (currentId !== undefined) currentId = id;
      currentIndex = index;
      oncurrentchange?.({ index, id });
    },
  });
</script>

<ul
  bind:this={listRef}
  {...rest}
  class={[
    "bx--progress",
    vertical && "bx--progress--vertical",
    spaceEqually && !vertical && "bx--progress--space-equal",
    className,
  ]}
  use:rovingFocus={{
    selector: ".bx--progress-step-button",
    rtl: () => resolveLayoutDirection($layoutDirection, listRef) === "rtl",
    get orientation() {
      return vertical ? "vertical" : "horizontal";
    },
    skipDisabled: true,
    focusOnMove: false,
    getActiveIndex: () => {
      if (!listRef) return -1;
      const items = Array.from(
        listRef.querySelectorAll(".bx--progress-step-button"),
      );
      return items.indexOf(/** @type {Element} */ (document.activeElement));
    },
    onMove: (index, event) => {
      // Leave Alt/Ctrl/Meta+Arrow (Back, scroll) to the browser.
      if (hasModifierKey(event)) return;
      // Arrow keys would otherwise also scroll the page.
      event.preventDefault();
      /** @type {HTMLElement | undefined} */ (
        listRef?.querySelectorAll(".bx--progress-step-button")[index]
      )?.focus();
    },
  }}
>
  {@render children?.()}
</ul>
