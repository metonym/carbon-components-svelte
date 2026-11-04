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
     * Set to `true` to render the tabs as page navigation: a list of links
     * where the selected link has `aria-current="page"`, instead of a tab list
     * that switches panels in place. Links keep the browser's Tab order and
     * arrow keys do not move between them. Give each `Tab` an `href`, set
     * `selectedIndex` or `selectedId` from the current route, label the
     * navigation with `aria-label`, and put the page in the `content`
     * snippet without `TabContent`.
     */
    navigation = false,

    /**
     * Specify the size of the vertical tabs.
     * `"xl"` matches the default height.
     * @type {"sm" | "md" | "lg" | "xl"}
     */
    size = "xl",

    /**
     * Specify the orientation of the tab list.
     * By default, the tabs are a vertical column at the `md` breakpoint and up,
     * and collapse into a horizontal, scrollable row below it.
     * Set to `"vertical"` to always render the column, or `"horizontal"` to
     * always render the row.
     * @type {"horizontal" | "vertical" | undefined}
     */
    orientation = undefined,

    /**
     * Called when the user selects a tab: by click, Enter or Space, or with
     * the arrow keys in automatic activation. Not called when `selectedIndex`
     * or `selectedId` is set from outside.
     * @type {((detail: { index: number; id: string }) => void) | undefined}
     */
    onselectedchange = undefined,

    /**
     * The `Tab`s.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /**
     * The `TabContent` panels, or the page when `navigation` is set,
     * rendered beside the tab list.
     * @type {import("svelte").Snippet | undefined}
     */
    content = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import { onMount, tick } from "svelte";
  import { breakpoints } from "../Breakpoint/breakpoints.js";
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

  // Vertical tabs are always the contained style, so a secondary label
  // renders whenever any tab provides one. They don't support the
  // auto-width, full-width, dismissible, or icon-only variants.
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
    iconOnly: false,
    autoWidth: false,
    fullWidth: false,
    dismissible: false,
    container: false,
    get navigation() {
      return navigation;
    },
    secondaryLabelSupported: true,
    dismissText: () => "",
    get onselectedchange() {
      return onselectedchange;
    },
    dismiss: () => {},
    getTabRoot: () => refTabList,
    getPanelRoot: () =>
      refRoot ? { root: refRoot, selector: "[role='tabpanel']" } : null,
  });

  // Below `md` the tabs switch from a vertical column to a horizontal,
  // scrollable row (Carbon React vertical-tabs responsive design), unless
  // `orientation` pins one layout. The query is the one the CSS compiles
  // `breakpoint-down(md)` to, so the keyboard orientation flips at the same
  // width as the layout (672px is already the column). Reading it during
  // init, not on mount, keeps the first render in step with the CSS.
  const belowMdQuery =
    typeof window === "undefined"
      ? undefined
      : window.matchMedia?.(`(max-width: ${breakpoints.md / 16 - 0.02}rem)`);
  let belowMd = $state(belowMdQuery?.matches ?? false);

  // The row layout reuses the same overflow scroll buttons as the horizontal
  // `Tabs`. The buttons only apply there (the column has no horizontal
  // overflow).
  let canScrollBackward = $state(false);
  let canScrollForward = $state(false);
  const isRow = $derived(
    orientation === undefined ? belowMd : orientation === "horizontal",
  );
  const isOverflow = $derived(isRow && (canScrollBackward || canScrollForward));
  // Roving focus follows the visual orientation: arrow Up/Down in the vertical
  // column, arrow Left/Right in the horizontal row.
  const listOrientation = $derived(isRow ? "horizontal" : "vertical");

  function updateOverflow() {
    if (!refTabList) return;
    const { scrollLeft, scrollWidth, clientWidth } = refTabList;
    // forwardEpsilon absorbs sub-pixel widths, as in `Tabs`. A browser can
    // report scrollWidth 1px larger than clientWidth plus scrollLeft with
    // nowhere left to scroll.
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
  // Observing again queues a fresh one, so this reruns when the tabs change
  // or the layout flips.
  $effect(() => {
    tabsState.tabs;
    isRow;
    stopObserving();
    stopObserving = refTabList
      ? observeResize(refTabList, handleListResize)
      : noop;
  });

  onMount(() => {
    /** @param {MediaQueryListEvent} event */
    const onBreakpointChange = (event) => {
      belowMd = event.matches;
    };
    belowMdQuery?.addEventListener("change", onBreakpointChange);
    return () => {
      stopObserving();
      belowMdQuery?.removeEventListener("change", onBreakpointChange);
    };
  });

  // The scroll buttons appear or hide once the list overflows, and that
  // moves the list's edges after a tab was scrolled into view. Keys
  // pressed before the first measurement leave the focused tab under a
  // button, so bring it back on each resize.
  function handleListResize() {
    updateOverflow();
    const focused = refTabList?.ownerDocument.activeElement;
    if (
      isRow &&
      focused instanceof HTMLElement &&
      focused.matches("[role='tab']") &&
      refTabList?.contains(focused)
    ) {
      scrollTabIntoView(focused);
    }
  }

  /** Keep a focused tab clear of the overflow chevrons / edge fades. */
  const SCROLL_INTO_VIEW_MARGIN = 48;

  /**
   * Scroll the horizontal tab row so `tab` is fully visible, inset from each
   * edge so it is not tucked under an overflow button.
   * @param {HTMLElement | undefined} tab
   */
  function scrollTabIntoView(tab) {
    scrollIntoViewX(refTabList, tab, SCROLL_INTO_VIEW_MARGIN);
  }

  /**
   * The row scrolls horizontally; disable the native focus scroll (a fixed
   * step that lags variable-width tabs) and scroll explicitly. The column
   * relies on the browser scrolling the page to the tab.
   * @param {number} index
   */
  async function focusTabElement(index) {
    await tick();
    const tab = /** @type {HTMLElement | undefined} */ (
      refTabList?.querySelectorAll("[role='tab']")[index]
    );
    tab?.focus({ preventScroll: isRow });
    if (isRow) scrollTabIntoView(tab);
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
</script>

<div
  bind:this={refRoot}
  class={[
    "bx--tabs--vertical-container",
    orientation === undefined && "bx--tabs--vertical-container--responsive",
    orientation === "vertical" && "bx--tabs--vertical-container--column",
  ]}
>
  <div
    role="navigation"
    {...rest}
    class={[
      "bx--tabs",
      "bx--tabs--vertical",
      orientation === undefined && "bx--tabs--vertical--responsive",
      orientation === "horizontal" && "bx--tabs--vertical--row",
      orientation === "vertical" && "bx--tabs--vertical--column",
      tabsState.hasSecondaryLabel && "bx--tabs--tall",
      isOverflow && "bx--tabs--scrollable bx--tabs--scrollable--container",
      size && `bx--layout--size-${size}`,
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
      aria-orientation={navigation ? undefined : listOrientation}
      use:rovingFocus={{
        // Navigation links have no tab role, so arrow keys leave them alone.
        selector: "[role='tab']",
        get orientation() {
          return listOrientation;
        },
        skipDisabled: true,
        getActiveIndex,
        // Only Left and Right swap, in the row layout.
        rtl: () =>
          resolveLayoutDirection($layoutDirection, refTabList) === "rtl",
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
</div>
