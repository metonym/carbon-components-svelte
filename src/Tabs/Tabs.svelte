<script>
  /**
   * @restProps {div}
   */

  let {
    /**
     * Specify the selected tab index.
     * Prefer `selectedId` when tabs can be added, removed or reordered: an
     * index then points at a different tab. Ignored when `selectedId` is set.
     * An out-of-range value selects the nearest tab.
     */
    selectedIndex = $bindable(0),

    /**
     * Specify the selected tab by id. Prefer it to `selectedIndex`.
     * When set, takes precedence over `selectedIndex` and stays on the same
     * logical tab as tabs are added or removed. Pair with a stable `id` on
     * each `Tab`.
     * @type {string | undefined}
     */
    selectedId = $bindable(undefined),

    /**
     * Choose whether arrow keys change the selection on focus.
     * Defaults to `"automatic"`. Set to `"manual"` so arrow keys only move
     * focus; press Enter or Space to select.
     * Ignored when `navigation` is set.
     * @type {"automatic" | "manual"}
     */
    activation = "automatic",

    /**
     * Specify the type of tabs.
     * @type {"default" | "container"}
     */
    type = "default",

    /**
     * Set to `true` to render the tabs as page navigation: a list of links
     * where the selected link has `aria-current="page"`, instead of a tab list
     * that switches panels in place. Links keep the browser's Tab order and
     * arrow keys do not move between them. Give each `Tab` an `href`, set
     * `selectedIndex` or `selectedId` from the current route, and label the
     * navigation with `aria-label`.
     */
    navigation = false,

    /** Set to `true` for tabs to have an auto-width */
    autoWidth = false,

    /** Set to `true` to render a dismiss button for each tab */
    dismissible = false,

    /**
     * Specify the accessible name of each tab's dismiss button.
     * Receives the tab's `label`, which is empty when the tab has none.
     * @type {(label: string) => string}
     */
    dismissText = (label) => (label ? `Dismiss ${label}` : "Dismiss tab"),

    /** Set to `true` for tabs to span the full width of the container */
    fullWidth = false,

    /**
     * Set to `true` to render icon-only tabs.
     * Each `Tab` displays only its `icon`; the `label` is used as the accessible
     * name and the tooltip shown on hover and focus.
     */
    iconOnly = false,

    /**
     * Specify the icon size for icon-only tabs.
     * `"lg"` uses the large scale (48px tabs with a 20px icon);
     * the default scale is 40px tabs with a 16px icon.
     * Only applies when `iconOnly` is `true`.
     * @type {"default" | "lg"}
     */
    iconSize = "default",

    /**
     * Specify the size of the tabs. Unset by default, which preserves the
     * original unsized height. Line tabs (`type="default"`) support up to
     * `"lg"`; container tabs support the full range up to `"xl"` — an
     * out-of-range value clamps to the type's max.
     * @type {"sm" | "md" | "lg" | "xl" | undefined}
     */
    size = undefined,

    /**
     * Called when the user selects a tab: by click, Enter or Space, or with
     * the arrow keys in automatic activation. Not called when `selectedIndex`
     * or `selectedId` is set from outside.
     * @type {((detail: { index: number; id: string }) => void) | undefined}
     */
    onselectedchange = undefined,

    /**
     * Called when the user dismisses a tab, by its close button or Delete.
     * Remove the tab to close it; focus moves to the tab that takes its place.
     * @type {((detail: { id: string; label: string; disabled: boolean; index: number }) => void) | undefined}
     */
    ondismiss = undefined,

    /**
     * The `Tab`s.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /**
     * The `TabContent` panels, rendered after the tab list.
     * @type {import("svelte").Snippet | undefined}
     */
    content = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import { onMount, tick } from "svelte";
  import {
    getPageHeader,
    hasPageHeader,
  } from "../PageHeader/page-header-context.js";
  import ChevronLeft from "../icons/ChevronLeft.svelte";
  import ChevronRight from "../icons/ChevronRight.svelte";
  import { hasModifierKey } from "../utils/has-modifier-key.js";
  import {
    computeScrollOverflow,
    scrollByViewport,
    scrollIntoViewX,
  } from "../utils/horizontal-scroll.js";
  import {
    getLayoutDirection,
    resolveLayoutDirection,
  } from "../utils/layout-direction.js";
  import { noop } from "../utils/noop.js";
  import { resolveTabsSize } from "../utils/resolve-tabs-size.js";
  import { rovingFocus } from "../utils/roving-focus.js";
  import { observeResize } from "../utils/shared-observer.js";
  import { provideTooltipGroup } from "../utils/tooltip-group.js";
  import { TabsState } from "./tabs-state.svelte.js";

  const layoutDirection = getLayoutDirection();

  // Icon-only tabs hand their tooltips off to each other, and to the rest
  // of an enclosing `TooltipGroup`.
  provideTooltipGroup();

  /** @type {null | HTMLUListElement} */
  let refTabList = $state(null);
  /** @type {null | HTMLDivElement} */
  let refRoot = $state(null);

  const tabsState = new TabsState({
    get selectedIndex() {
      return selectedIndex;
    },
    set selectedIndex(value) {
      selectedIndex = value;
    },
    get selectedId() {
      return selectedId;
    },
    set selectedId(value) {
      selectedId = value;
    },
    get hasContent() {
      return content !== undefined;
    },
    get iconOnly() {
      return iconOnly;
    },
    get autoWidth() {
      return autoWidth;
    },
    get fullWidth() {
      return fullWidth;
    },
    get dismissible() {
      return dismissible;
    },
    get container() {
      return type === "container";
    },
    get navigation() {
      return navigation;
    },
    // Only container tabs draw a secondary label.
    get secondaryLabelSupported() {
      return type === "container";
    },
    dismissText: (label) => dismissText(label),
    get onselectedchange() {
      return onselectedchange;
    },
    dismiss,
    getTabRoot: () => refTabList,
    getPanelRoot: () => {
      // Panels of tabs in a `PageHeader` render in its body, which binds
      // after these tabs mount.
      if (pageHeader) {
        const body = pageHeader.getBody();
        return body
          ? { root: body, selector: ":scope > [role='tabpanel']" }
          : null;
      }
      return refRoot?.parentElement
        ? { root: refRoot.parentElement, selector: "[role='tabpanel']" }
        : null;
    },
  });

  // Lets `TabContent` in a `PageHeader` body pair with tabs in its header;
  // panels then live in the body, not beside these tabs.
  const pageHeader = hasPageHeader()
    ? getPageHeader()?.registerTabs(tabsState.context)
    : undefined;

  $effect.pre(() => {
    pageHeader?.setType(type);
  });

  // Carbon React v11 replaces the legacy mobile dropdown with a horizontally
  // scrollable tab list plus overflow navigation buttons. The buttons appear
  // only when the list overflows, and each one hides once that edge is reached.
  let canScrollBackward = $state(false);
  let canScrollForward = $state(false);
  const isOverflow = $derived(canScrollBackward || canScrollForward);

  function updateOverflow() {
    if (!refTabList) return;
    const { scrollLeft, scrollWidth, clientWidth } = refTabList;
    // forwardEpsilon absorbs sub-pixel widths. Firefox can report scrollWidth
    // 1px larger than clientWidth with nowhere to scroll; ignore that gap so
    // the forward button does not flicker in.
    ({ canScrollBackward, canScrollForward } = computeScrollOverflow({
      scrollLeft,
      scrollWidth,
      clientWidth,
      forwardEpsilon: 1,
    }));
  }

  let stopObserving = noop;

  // Observing queues a measurement that runs with every other instance's in
  // one batch after layout, instead of forcing a layout per instance.
  // Observing again queues a fresh one, so this reruns when the set of tabs
  // changes (added, removed or relabeled).
  $effect(() => {
    tabsState.tabs;
    stopObserving();
    stopObserving = refTabList
      ? observeResize(refTabList, handleListResize)
      : noop;
  });

  onMount(() => () => {
    stopObserving();
    pageHeader?.unregister();
  });

  // The scroll buttons appear or hide once the list overflows, and that
  // moves the list's edges after a tab was scrolled into view. Keys
  // pressed before the first measurement leave the focused tab under a
  // button, so bring it back on each resize.
  function handleListResize() {
    updateOverflow();
    const focused = refTabList?.ownerDocument.activeElement;
    if (
      focused instanceof HTMLElement &&
      focused.matches("[role='tab']") &&
      refTabList?.contains(focused)
    ) {
      scrollTabIntoView(focused);
    }
  }

  /**
   * Call `ondismiss`. When the handler removes the focused tab, move focus
   * to the tab that took its place (or the new last tab) instead of `<body>`.
   * @param {string} id
   */
  async function dismiss(id) {
    const index = tabsState.tabs.findIndex((tab) => tab.id === id);
    const tab = tabsState.tabs[index];
    if (!tab) return;

    const list = refTabList;
    const doc = list?.ownerDocument;
    const hadFocus = Boolean(doc && list?.contains(doc.activeElement));
    ondismiss?.({ id, label: tab.label, disabled: tab.disabled, index });
    if (!hadFocus || !doc) return;

    // Let the handler's removal render, then keep focus in the list.
    await tick();
    if (!refTabList || (doc.activeElement && doc.activeElement !== doc.body)) {
      return;
    }

    const items = refTabList.querySelectorAll(".bx--tabs__nav-link");
    if (items.length === 0) return;
    const next = /** @type {HTMLElement} */ (
      items[Math.min(index, items.length - 1)]
    );
    next.focus({ preventScroll: true });
    scrollTabIntoView(next);
  }

  /** Keep a focused tab clear of the overflow chevrons / edge fades. */
  const SCROLL_INTO_VIEW_MARGIN = 48;

  /**
   * Scroll the tab list so `tab` is fully visible, inset from each edge so it is
   * not tucked under an overflow button. The browser's native focus scroll moves
   * a fixed step that lags variable-width tabs, eventually pushing the focused
   * tab off-screen, so selection is scrolled explicitly instead.
   * @param {HTMLElement | undefined} tab
   */
  function scrollTabIntoView(tab) {
    scrollIntoViewX(refTabList, tab, SCROLL_INTO_VIEW_MARGIN);
  }

  /** @param {number} index */
  async function focusTabElement(index) {
    await tick();
    const tab = /** @type {HTMLElement | undefined} */ (
      refTabList?.querySelectorAll("[role='tab']")[index]
    );
    tab?.focus({ preventScroll: true });
    scrollTabIntoView(tab);
  }

  /**
   * Arrow keys move from the tab that holds focus. Fall back to the
   * manual-mode focus index, then the selection, when focus is elsewhere.
   */
  function getActiveIndex() {
    const items = refTabList
      ? Array.from(refTabList.querySelectorAll("[role='tab']"))
      : [];
    const index = items.indexOf(
      /** @type {Element} */ (refTabList?.ownerDocument.activeElement),
    );
    if (index >= 0) return index;
    return tabsState.focusedIndex >= 0
      ? tabsState.focusedIndex
      : tabsState.currentIndex;
  }

  const resolvedSize = $derived(
    resolveTabsSize(size, type === "container" ? 3 : 2),
  );
</script>

<div
  bind:this={refRoot}
  role="navigation"
  {...rest}
  class={[
    "bx--tabs",
    type === "container" ? "bx--tabs--container" : "bx--tabs--line",
    tabsState.hasSecondaryLabel && "bx--tabs--tall",
    fullWidth && "bx--tabs--full-width",
    dismissible && "bx--tabs--dismissible",
    iconOnly && "bx--tabs--icon-only",
    iconOnly && iconSize === "lg" && "bx--tabs__icon--lg",
    isOverflow && "bx--tabs--scrollable",
    isOverflow && type === "container" && "bx--tabs--scrollable--container",
    resolvedSize && `bx--layout--size-${resolvedSize}`,
    className,
  ]}
>
  {#if isOverflow}
    <button
      type="button"
      tabindex="-1"
      aria-hidden="true"
      class={[
        "bx--tab--overflow-nav-button",
        "bx--tab--overflow-nav-button--previous",
        !canScrollBackward && "bx--tab--overflow-nav-button--hidden",
      ]}
      onclick={() => scrollByViewport(refTabList, -1)}
    >
      <ChevronLeft />
    </button>
    <div
      class={[
        "bx--tabs__overflow-indicator--left",
        !canScrollBackward && "bx--tab--overflow-nav-button--hidden",
      ]}
    ></div>
  {/if}
  <ul
    bind:this={refTabList}
    role={navigation ? undefined : "tablist"}
    use:rovingFocus={{
      // Navigation links have no tab role, so arrow keys leave them alone.
      selector: "[role='tab']",
      orientation: "horizontal",
      skipDisabled: true,
      getActiveIndex,
      rtl: () => resolveLayoutDirection($layoutDirection, refTabList) === "rtl",
      onMove: (index, event) => {
        // Alt/Ctrl/Meta+Arrow belong to the browser (Alt/Cmd+Left is Back).
        if (hasModifierKey(event)) return;
        // Prevent the arrow keys from also scrolling the page.
        event.preventDefault();
        if (index < 0 || index >= tabsState.tabs.length) return;
        if (activation === "manual") tabsState.focusedIndex = index;
        else tabsState.selectIndex(index);
        focusTabElement(index);
      },
    }}
    class="bx--tabs__nav"
    onscroll={updateOverflow}
  >
    {@render children?.()}
  </ul>
  {#if isOverflow}
    <div
      class={[
        "bx--tabs__overflow-indicator--right",
        !canScrollForward && "bx--tab--overflow-nav-button--hidden",
      ]}
    ></div>
    <button
      type="button"
      tabindex="-1"
      aria-hidden="true"
      class={[
        "bx--tab--overflow-nav-button",
        "bx--tab--overflow-nav-button--next",
        !canScrollForward && "bx--tab--overflow-nav-button--hidden",
      ]}
      onclick={() => scrollByViewport(refTabList, 1)}
    >
      <ChevronRight />
    </button>
  {/if}
</div>
{@render content?.()}
