<script>
  /**
   * Render a row of `Tag` children. `TagSet` measures the available width and
   * collapses whatever no longer fits into a "+N" overflow indicator, with a
   * hover tooltip listing the hidden labels by default. Override the tooltip
   * content with the `overflowTooltip` snippet, for example to add a link.
   * @restProps {div}
   * @typedef {import("./tag-set-context.js").TagSetItem} TagSetItem
   */

  const fallbackId = $props.id();

  let {
    /**
     * Horizontal alignment of the visible tag row.
     * @type {"start" | "center" | "end"}
     */
    align = "start",

    /**
     * Alignment of the overflow tooltip relative to the "+N" indicator.
     * @type {"start" | "center" | "end"}
     */
    overflowAlign = "center",

    /**
     * Direction of the overflow tooltip relative to the "+N" indicator.
     * @type {"top" | "bottom"}
     */
    overflowDirection = "bottom",

    /**
     * How the "+N" indicator shows the hidden tags. `"tooltip"` lists their
     * labels in a hover tooltip. `"popover"` makes the indicator a button that
     * opens a popover of the hidden tags themselves, so dismissible ones can
     * still be closed and touch users can reach them.
     * @type {"tooltip" | "popover"}
     */
    overflowMode = "tooltip",

    /**
     * How the "+N" indicator lists the hidden tags: `"default"` lists their
     * labels as text, `"tag"` as tags in their own colors. In the popover and
     * the "View all" modal, `"tag"` keeps dismissible tags closable.
     * Defaults to `"default"` for the tooltip and `"tag"` for the popover.
     * @type {"default" | "tag" | undefined}
     */
    overflowType = undefined,

    /**
     * With more hidden tags than this, the popover lists only this many and
     * adds a "View all" button, and clicking a tooltip-mode "+N" opens the
     * modal directly. The modal lists every tag, with a search field.
     * Set to `Infinity` to never offer it.
     * @type {number}
     */
    viewAllThreshold = 10,

    /** Text of the popover's "View all" button. */
    viewAllText = "View all",

    /** Heading of the "View all" modal, also the name of its tag list. */
    allTagsTitle = "All tags",

    /** Label and placeholder of the "View all" modal's search field. */
    allTagsSearchLabel = "Search tags",

    /**
     * Text announced, and shown when nothing matches, for the number of tags
     * the "View all" search finds.
     * @type {(count: number) => string}
     */
    allTagsResultsLabel = (count) =>
      count === 0
        ? "No matching tags"
        : count === 1
          ? "1 tag"
          : `${count} tags`,

    /** Set to `true` to open the "View all" modal. */
    allTagsOpen = $bindable(false),

    /**
     * Accessible name of the "+N" overflow indicator. Keep the visible "+N"
     * in the name so speech-input users can say what they see.
     * @type {(count: number) => string}
     */
    overflowLabel = (count) => `+${count} more tags`,

    /**
     * Hard cap on visible tags regardless of available space.
     * @type {number | undefined}
     */
    maxVisible = undefined,

    /**
     * Keyboard navigation between tags. `"tab"` puts every interactive tag in
     * the tab order. `"roving"` makes the set a single tab stop: arrow keys,
     * Home, and End move between tags and the "+N" indicator, and Delete or
     * Backspace closes a focused dismissible tag.
     * @type {"tab" | "roving"}
     */
    navigation = "tab",

    /** Set to `true` to wrap all tags instead of collapsing to overflow. */
    multiline = false,

    /** Subtracted from the measured available width before fitting tags. */
    measurementOffset = 0,

    /**
     * Custom element to measure instead of `TagSet`'s own wrapper.
     * @type {HTMLElement | undefined}
     */
    containingElement = undefined,

    /**
     * Size of every tag, including the "+N" overflow indicator. Applies to
     * `Tag` children without their own `size`.
     * Also accepts Carbon v11's `"md"` (`"default"`).
     * @type {"xs" | "sm" | "default" | "lg" | "md" | undefined}
     */
    size = undefined,

    /**
     * Spacing between tags. Accepts a Carbon layout scale (`0`–`13`) or a CSS
     * length string.
     * @type {import("../Stack/Stack.svelte").StackScale | string}
     */
    gap = 3,

    /**
     * Set an id for the top-level element.
     * The overflow tooltip id derives from it as `{id}-overflow`.
     * @type {string}
     */
    id = fallbackId,

    /**
     * Called when the user closes a dismissible (`filter`) tag in the set,
     * from the row, the popover or the "View all" modal. Remove the tag to
     * close it; focus moves to a neighbouring tag.
     * @type {((detail: { tag: TagSetItem; index: number }) => void) | undefined}
     */
    ontagdismiss = undefined,

    /**
     * Called when the user clicks the "+N" indicator. Call `preventDefault()`
     * to keep a tooltip-mode set from opening the "View all" modal.
     * @type {((detail: import("../utils/cancelable.js").Cancelable<{ count: number }>) => void) | undefined}
     */
    onoverflowclick = undefined,

    /**
     * Called when the number of tags collapsed into "+N" changes: from a
     * resize, tags added or removed, or a `maxVisible` change. This reports
     * layout, not a user action, so it's called after measuring, not on the
     * first render before the set has measured.
     * @type {((detail: { count: number }) => void) | undefined}
     */
    onoverflowchange = undefined,

    /**
     * Override what the "+N" indicator shows: its tooltip, or its popover
     * with `overflowMode="popover"`. Defaults to the hidden labels as text,
     * or as tags in the popover.
     * @type {import("svelte").Snippet<[{ tags: TagSetItem[]; count: number }]> | undefined}
     */
    overflowTooltip = undefined,

    /**
     * The `Tag`s.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {import("svelte/elements").FocusEventHandler<HTMLDivElement> | undefined | null} */
    onfocusin = undefined,

    /** @type {import("svelte/elements").KeyboardEventHandler<HTMLDivElement> | undefined | null} */
    onkeydown = undefined,

    ...rest
  } = $props();

  import { onMount, tick, untrack } from "svelte";
  import Stack from "../Stack/Stack.svelte";
  import { cancelable } from "../utils/cancelable.js";
  import { returnFocus } from "../utils/focus.js";
  import { hasModifierKey } from "../utils/has-modifier-key.js";
  import {
    getLayoutDirection,
    resolveLayoutDirection,
  } from "../utils/layout-direction.js";
  import { noop } from "../utils/noop.js";
  import { observeDomOrder } from "../utils/observe-dom-order.js";
  import { rafThrottle } from "../utils/raf-throttle.js";
  import { rovingFocus } from "../utils/roving-focus.js";
  import { observeResize } from "../utils/shared-observer.js";
  import { normalizeSize, TAG_SIZE_ALIASES } from "../utils/size-aliases.js";
  import { sortByDomOrder } from "../utils/sort-by-dom-order.js";
  import { getVisibleTagCount } from "../utils/tag-overflow.js";
  import TagSetAllTags from "./TagSetAllTags.svelte";
  import TagSetOverflow from "./TagSetOverflow.svelte";
  import { setTagSet } from "./tag-set-context.js";

  const layoutDirection = getLayoutDirection();

  const resolvedSize = $derived(normalizeSize(size, TAG_SIZE_ALIASES));

  /**
   * Tags, in DOM order. Each registers while it initializes, and fills in
   * its element and label once mounted.
   * @type {ReadonlyArray<TagSetItem>}
   */
  let items = $state.raw([]);
  /** Ids of the tags collapsed into "+N". */
  let overflowIds = $state.raw(/** @type {Set<string>} */ (new Set()));

  // Roving tab stop: the registered item id (or the overflow indicator)
  // whose element is the set's single `tabindex="0"`. `null` until measured,
  // so server-rendered tags keep their native tab order.
  const OVERFLOW_TAB_STOP = "overflow";
  /** @type {string | null} */
  let tabStopId = $state(null);

  // The first render registers in document order. A tag added after mount
  // registers last wherever it renders, so the list is sorted into DOM order
  // once its element is known.
  let mounted = false;
  let needsSort = false;

  /** @type {null | HTMLDivElement} */
  let wrapperRef = $state(null);
  /** @type {null | HTMLElement} */
  let overflowTriggerRef = $state(null);
  /** @type {null | HTMLElement} */
  let overflowButtonRef = $state(null);
  /** @type {null | HTMLElement} */
  let overflowContentRef = $state(null);
  let overflowOpen = $state(false);

  let visibleCount = $state(0);
  // False until the first measure, as in the server's markup: a one-line
  // set clips its tags to its width until it knows how many fit.
  let measured = $state(false);

  // Until the set measures, nothing counts as hidden.
  const shownCount = $derived(measured ? visibleCount : items.length);
  const overflowTags = $derived(items.slice(shownCount));
  const overflowCount = $derived(overflowTags.length);
  const overflowTooltipText = $derived(
    overflowTags.map((tag) => tag.label).join(", "),
  );

  /**
   * The element a tag contributes to keyboard navigation: the tag itself
   * when it's a button or link, else its close button. Skips the truncation
   * tooltip trigger inside a capped-width label.
   * @param {HTMLElement | null | undefined} node
   * @returns {HTMLElement | null}
   */
  function focusableIn(node) {
    if (!node) return null;
    if (node.matches("button:not(:disabled), a[href]")) return node;
    return node.querySelector(".bx--tag__close-icon:not(:disabled)");
  }

  /** @param {TagSetItem} item */
  function handleTagClose(item) {
    const index = items.findIndex((other) => other.id === item.id);
    // Closing usually removes the tag, unmounting its focused close button.
    // Hand focus to the next visible tag, else the previous one, else the
    // overflow trigger, instead of letting it fall to <body>.
    const hadFocus = item.node?.contains(document.activeElement);
    const neighbours = hadFocus
      ? [...items.slice(index + 1), ...items.slice(0, index).reverse()]
          .filter((other) => !overflowIds.has(other.id))
          .map((other) => focusableIn(other.node))
      : [];

    ontagdismiss?.({ tag: item, index });

    if (!hadFocus) return;
    tick().then(() => {
      if (item.node?.isConnected) return;
      returnFocus(
        [...neighbours, overflowTriggerRef].find((el) => el?.isConnected),
      );
    });
  }

  setTagSet({
    get size() {
      return normalizeSize(size, TAG_SIZE_ALIASES);
    },
    get navigation() {
      return navigation;
    },
    get tabStopId() {
      return tabStopId;
    },
    register(item) {
      if (items.some((existing) => existing.id === item.id)) return;
      items = [...items, item];
      if (mounted) needsSort = true;
    },
    unregister(id) {
      items = items.filter((item) => item.id !== id);
    },
    update(id, patch) {
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return;
      const current = items[index];
      const changed = Object.entries(patch).some(
        ([key, value]) =>
          current[/** @type {keyof TagSetItem} */ (key)] !== value,
      );
      if (!changed) return;
      const next = [...items];
      next[index] = { ...current, ...patch };
      if (needsSort && next.every((item) => item.node)) {
        needsSort = false;
        items = sortByDomOrder(next);
      } else {
        items = next;
      }
    },
    isOverflow(id) {
      return overflowIds.has(id);
    },
    notifyClose(id) {
      const item = items.find((item) => item.id === id);
      if (item) handleTagClose(item);
    },
  });

  /**
   * Visible tags with a focusable element, in DOM order, then the "+N"
   * indicator when it shows. Reads `visibleCount` directly so it's current
   * inside `measure()`, before the derived overflow values update.
   * @returns {{ id: string; element: HTMLElement }[]}
   */
  function rovingItems() {
    if (navigation !== "roving") return [];
    const entries = items
      .slice(0, visibleCount)
      .map((item) => ({ id: item.id, element: focusableIn(item.node) }))
      .filter(
        /** @returns {entry is { id: string; element: HTMLElement }} */
        (entry) => entry.element !== null,
      );
    if (visibleCount < items.length && overflowButtonRef) {
      entries.push({ id: OVERFLOW_TAB_STOP, element: overflowButtonRef });
    }
    return entries;
  }

  // Keep the tab stop on an element that's still visible and enabled, else
  // move it to the first one.
  function syncTabStop() {
    if (navigation !== "roving") {
      tabStopId = null;
      return;
    }
    const entries = rovingItems();
    if (entries.some((entry) => entry.id === tabStopId)) return;
    tabStopId = entries[0]?.id ?? null;
  }

  // Nothing left to disclose.
  $effect.pre(() => {
    if (overflowCount === 0) untrack(() => (overflowOpen = false));
  });

  /**
   * A dismissible tag in the overflow popover or the "View all" modal was
   * closed. Click the hidden original's close button, so its own
   * `ondismiss` runs before `ontagdismiss`, as it would from the row.
   * @param {TagSetItem} item
   */
  function closeOriginal(item) {
    /** @type {HTMLElement | null | undefined} */ (
      item.node?.querySelector(".bx--tag__close-icon:not(:disabled)")
    )?.click();
  }

  // The popover's last tag closed while it held focus: fall back to the
  // "+N" indicator, else to the last visible tag.
  function handleOverflowEmpty() {
    const lastVisible = items
      .slice(0, visibleCount)
      .map((other) => focusableIn(other.node))
      .filter(Boolean)
      .pop();
    returnFocus(visibleCount < items.length ? overflowButtonRef : lastVisible);
  }

  /** @param {FocusEvent & { currentTarget: EventTarget & HTMLDivElement }} event */
  function handleFocusIn(event) {
    onfocusin?.(event);
    const entry = rovingItems().find((entry) => entry.element === event.target);
    if (entry) tabStopId = entry.id;
  }

  /** @param {KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }} event */
  function handleKeydown(event) {
    onkeydown?.(event);
    if (event.key !== "Delete" && event.key !== "Backspace") return;
    // A held key would close tag after tag as focus moves to the next one.
    if (event.repeat || event.defaultPrevented || hasModifierKey(event)) return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches(".bx--tag__close-icon")) return;
    if (!rovingItems().some((entry) => entry.element === target)) return;
    event.preventDefault();
    // Same path as a pointer click, so the tag's own `ondismiss` runs too.
    target.click();
  }

  function measure() {
    if (multiline) {
      visibleCount =
        maxVisible == null ? items.length : Math.min(items.length, maxVisible);
    } else {
      const measureRoot = containingElement || wrapperRef;
      if (!measureRoot) return;

      const availableWidth = Math.max(
        0,
        measureRoot.offsetWidth - measurementOffset,
      );
      const tagWidths = items.map((item) => item.node?.offsetWidth ?? 0);
      const overflowWidth = overflowTriggerRef?.offsetWidth ?? 0;

      visibleCount = getVisibleTagCount({
        tagWidths,
        availableWidth,
        overflowWidth,
        maxVisible,
      });
    }

    overflowIds = new Set(items.slice(visibleCount).map((item) => item.id));
    syncTabStop();
    measured = true;
  }

  const throttledMeasure = rafThrottle(measure);

  onMount(() => {
    mounted = true;
    const stops = [wrapperRef, containingElement].map((element) =>
      element ? observeResize(element, () => throttledMeasure()) : noop,
    );
    // A keyed reorder moves tags without re-registering them. Registered ids
    // aren't the tags' DOM ids, so compare by each node's own id.
    if (wrapperRef) {
      stops.push(
        observeDomOrder(wrapperRef, {
          selector: ".bx--tag",
          getItems: () => items.map((item) => ({ id: item.node?.id ?? "" })),
          onReorder: () => {
            items = sortByDomOrder([...items]);
          },
        }),
      );
    }

    return () => {
      for (const stop of stops) stop();
      throttledMeasure.cancel();
    };
  });

  // Re-measure whenever the registered tags, `maxVisible`, `multiline` or
  // `navigation` change, after the DOM settles from that change. Tags fill
  // in their elements once mounted, which re-runs this too.
  $effect(() => {
    items;
    maxVisible;
    multiline;
    navigation;
    if (wrapperRef) tick().then(measure);
  });

  // Reports the overflow count as it changes. Starts from 0, the count
  // before the set measures.
  let reportedOverflowCount = 0;
  $effect(() => {
    const next = overflowCount;
    untrack(() => {
      if (next === reportedOverflowCount) return;
      reportedOverflowCount = next;
      onoverflowchange?.({ count: next });
    });
  });

  const resolvedOverflowType = $derived(
    overflowType ?? (overflowMode === "popover" ? "tag" : "default"),
  );
  const hasViewAll = $derived(overflowCount > viewAllThreshold);
  // Keep the modal mounted while open, even if closing tags drops the
  // count back under the threshold.
  const mountAllTags = $derived(hasViewAll || allTagsOpen);

  let allTagsQuery = $state("");
  /** @type {null | HTMLUListElement} */
  let allTagsListRef = $state(null);
  const allTagsMatches = $derived(
    allTagsOpen
      ? filterTags(items, allTagsQuery.trim().toLocaleLowerCase())
      : [],
  );
  // A fresh search each time the modal opens.
  $effect.pre(() => {
    if (!allTagsOpen) untrack(() => (allTagsQuery = ""));
  });

  /**
   * @param {ReadonlyArray<TagSetItem>} tags
   * @param {string} query
   */
  function filterTags(tags, query) {
    if (!query) return [...tags];
    return tags.filter((tag) => tag.label.toLocaleLowerCase().includes(query));
  }

  function openAllTags() {
    // The modal returns focus to what had it on open. The popover's
    // "View all" button is about to unmount, so hand that to "+N" first.
    overflowButtonRef?.focus();
    overflowOpen = false;
    allTagsOpen = true;
  }

  /**
   * A dismissible tag in the modal was closed: close the original, as the
   * popover does, then keep focus in the list.
   * @param {TagSetItem} item
   */
  function handleAllTagsClose(item) {
    const position = allTagsMatches.indexOf(item);
    const hadFocus = allTagsListRef?.contains(document.activeElement);
    closeOriginal(item);
    if (!hadFocus) return;
    tick().then(() => {
      if (item.node?.isConnected) return;
      const buttons = Array.from(
        allTagsListRef?.querySelectorAll(
          ".bx--tag__close-icon:not(:disabled)",
        ) ?? [],
      );
      returnFocus(
        /** @type {HTMLElement | undefined} */ (
          buttons[Math.min(position, buttons.length - 1)]
        ) ?? allTagsListRef?.closest(".bx--modal")?.querySelector("input"),
        allTagsListRef,
      );
    });
  }

  function handleTriggerClick() {
    const payload = cancelable({ count: overflowCount });
    onoverflowclick?.(payload);
    if (!payload.defaultPrevented && overflowMode === "tooltip" && hasViewAll) {
      openAllTags();
    }
  }
</script>

{#snippet overflowContent(
  /** @type {{ tags: TagSetItem[]; count: number }} */ args,
)}
  {#if overflowTooltip}
    {@render overflowTooltip(args)}
  {:else}
    {overflowTooltipText}
  {/if}
{/snippet}

<div
  bind:this={wrapperRef}
  {id}
  use:rovingFocus={{
    selector: "button, a[href]",
    rtl: () => resolveLayoutDirection($layoutDirection, wrapperRef) === "rtl",
    getItems: () => rovingItems().map((entry) => entry.element),
    getActiveIndex: () =>
      Math.max(
        0,
        rovingItems().findIndex((entry) => entry.id === tabStopId),
      ),
    onMove: (index, event) => {
      if (hasModifierKey(event)) return;
      const entry = rovingItems()[index];
      tabStopId = entry?.id ?? null;
      entry?.element.focus();
    },
    focusOnMove: false,
    wrap: false,
    itemsOnly: true,
  }}
  {...rest}
  class={[
    "bx--tag-set",
    !multiline && !measured && "bx--tag-set--unmeasured",
    className,
  ]}
  onfocusin={handleFocusIn}
  onkeydown={handleKeydown}
>
  <Stack
    orientation="horizontal"
    align="center"
    {gap}
    wrap={multiline ? "wrap" : "nowrap"}
    justify={align === "start"
      ? "start"
      : align === "center"
        ? "center"
        : "end"}
    class="bx--tag-set__space"
  >
    {@render children?.()}
    <TagSetOverflow
      bind:triggerRef={overflowTriggerRef}
      bind:buttonRef={overflowButtonRef}
      bind:contentRef={overflowContentRef}
      bind:open={overflowOpen}
      mode={overflowMode}
      type={resolvedOverflowType}
      {viewAllThreshold}
      {viewAllText}
      customContent={!!overflowTooltip}
      tabindex={tabStopId === null
        ? undefined
        : tabStopId === OVERFLOW_TAB_STOP
          ? "0"
          : "-1"}
      id="{id}-overflow"
      count={overflowCount}
      tags={overflowTags}
      {overflowAlign}
      {overflowDirection}
      {overflowLabel}
      size={resolvedSize}
      ontrigger={handleTriggerClick}
      ontagdismiss={closeOriginal}
      onempty={handleOverflowEmpty}
      onviewall={openAllTags}
      {overflowContent}
    />
  </Stack>
</div>

{#if mountAllTags}
  <TagSetAllTags
    bind:open={allTagsOpen}
    bind:listRef={allTagsListRef}
    bind:query={allTagsQuery}
    tags={allTagsMatches}
    closable={resolvedOverflowType === "tag"}
    title={allTagsTitle}
    searchLabel={allTagsSearchLabel}
    resultsLabel={allTagsResultsLabel}
    size={resolvedSize}
    ontagdismiss={handleAllTagsClose}
  />
{/if}
