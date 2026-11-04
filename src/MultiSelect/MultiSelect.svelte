<script module>
  /**
   * Index `entries` by id, bucketing same-id entries in order so duplicate
   * ids pair up positionally (first old duplicate reused for the first new
   * occurrence) instead of one id silently overwriting another.
   * @param {ReadonlyArray<{ id: any }>} entries
   * @returns {Map<any, any[]>}
   */
  function indexById(entries) {
    const map = new Map();
    for (const entry of entries) {
      const bucket = map.get(entry.id);
      if (bucket) bucket.push(entry);
      else map.set(entry.id, [entry]);
    }
    return map;
  }

  /**
   * Whether `ids` holds exactly the ids in `idSet`, ignoring order and
   * duplicates. Sizes are compared as sets, not by `ids.length`: a duplicate
   * (`["1", "1"]` against `{"1", "2"}`) matches on length and membership
   * while selecting something different.
   * @param {ReadonlyArray<any>} ids
   * @param {Set<any>} idSet
   * @returns {boolean}
   */
  function sameIdSet(ids, idSet) {
    if (ids.length < idSet.size) return false;
    if (!ids.every((id) => idSet.has(id))) return false;
    return new Set(ids).size === idSet.size;
  }

  /**
   * Value-compare two `selectedIds` arrays, ignoring order: `sort()` only
   * ever tests membership via a `Set`, so a reordered-but-otherwise-equal
   * array produces the same result and shouldn't trigger a re-sort.
   * @param {ReadonlyArray<any>} a
   * @param {ReadonlyArray<any>} b
   * @returns {boolean}
   */
  function sameSelectedIds(a, b) {
    return sameIdSet(a, new Set(b));
  }
</script>

<script>
  /**
   * @template {MultiSelectItem<any>} [Item=MultiSelectItem<any>]
   * @restProps {input | button}
   */

  /** @typedef {string} MultiSelectItemText */

  /**
   * @template [Id=any]
   * @typedef {object} MultiSelectItem
   * @property {Id} id
   * @property {MultiSelectItemText} text
   * @property {boolean} [disabled] - Whether the item is disabled
   * @property {boolean} [isSelectAll] - Whether this item acts as a "select all" toggle
   * @property {string} [group] - Group label. Items sharing a label render together under a non-selectable header, groups in order of first appearance and `sortItem` sorting within each group.
   */

  const fallbackId = $props.id();

  let {
    /**
     * Set the multiselect items.
     * @type {ReadonlyArray<Item>}
     */
    items = [],

    /**
     * Override the display of a multiselect item.
     * @type {(item: Item) => string | Item["id"]}
     */
    itemToString = (item) => item.text ?? item.id,

    /**
     * Override `name`/`value` for the hidden inputs that mirror the current
     * selection for native form submission, and `title`/`labelText` for the
     * visible option checkbox. `name`/`value` do not reach the option
     * checkbox itself -- it is decorative and excluded from form
     * participation, even while the menu is open.
     * @type {(item: Item) => { name?: string; labelText?: string; title?: string; value?: string }}
     */
    itemToInput = (_item) => ({}),

    /**
     * Set the selected ids.
     * @type {ReadonlyArray<Item["id"]>}
     */
    selectedIds = $bindable([]),

    /**
     * Specify the filter text of a `filterable` multiselect.
     * @type {string}
     */
    value = $bindable(""),

    /**
     * Set the size of the multiselect.
     * Inherits the parent `Form` size when unset.
     * Also accepts Carbon v11's `"md"` (the 40px default, which overrides a
     * `Form` size). `"lg"` and `"xl"` are both 48px.
     * @type {"xs" | "sm" | "md" | "lg" | "xl" | undefined}
     */
    size = undefined,

    /**
     * Specify the type of multiselect.
     * @type {"default" | "inline"}
     */
    type = /** @type {"default" | "inline"} */ ("default"),

    /**
     * Specify the direction of the multiselect dropdown menu.
     * @type {"bottom" | "top"}
     */
    direction = /** @type {"bottom" | "top"} */ ("bottom"),

    /**
     * Specify the selection feedback after selecting items.
     * @type {"top" | "fixed" | "top-after-reopen"}
     */
    selectionFeedback = /** @type {"top" | "fixed" | "top-after-reopen"} */ (
      "top-after-reopen"
    ),

    /**
     * Cap how many items can be selected at once.
     * Unset or a non-positive value means unlimited.
     * When set, select-all is unavailable and unchecked items disable once the cap is reached.
     * @type {number | undefined}
     */
    maxSelectedItems = undefined,

    /**
     * How the field shows the selection. `"count"` shows only the count tag
     * in the field. `"tags"` also lists each selected item as a dismissible
     * tag below the field, so the selection stays visible while the menu is
     * closed.
     * @type {"count" | "tags"}
     */
    selectionDisplay = /** @type {"count" | "tags"} */ ("count"),

    /**
     * With `selectionDisplay="tags"`, `"wrap"` shows every selected tag on as
     * many rows as needed, and `"collapse"` keeps one row and collapses the
     * rest into a "+N" button. The button opens the hidden tags in a popover,
     * where they can still be removed.
     * @type {"wrap" | "collapse"}
     */
    tagOverflow = /** @type {"wrap" | "collapse"} */ ("wrap"),

    /**
     * With `selectionDisplay="tags"`, the accessible name prefix of each
     * tag's remove button.
     */
    removeTagText = "Remove",

    /** Set to `true` to disable the dropdown */
    disabled = false,

    /** Set to `true` to filter items */
    filterable = false,

    /**
     * Override the filtering logic.
     * The default matches items whose `text` contains the typed value,
     * ignoring case and leading or trailing whitespace.
     * @type {(item: Item, value: string) => boolean}
     */
    filterItem = (item, value) =>
      item.text.toLowerCase().includes(value.trim().toLowerCase()),

    /**
     * Set to `true` to select all text in the filter input when it receives
     * focus (e.g. on tab or click). Only applies when `filterable` is `true`.
     */
    selectTextOnFocus = false,

    /** Set to `true` to open the dropdown. */
    open = $bindable(false),

    /**
     * Set to `true` to use the fluid variant.
     * Inherited from the parent `FluidForm` context,
     * so it does not need to be set when used inside `FluidForm`.
     * Cannot be combined with the inline variant.
     */
    fluid = false,

    /**
     * Set to `true` to render condensed menu items in the fluid variant.
     * Menu items use the default height instead of the taller fluid height.
     * Only applies when the fluid variant is active.
     */
    condensed = false,

    /** Specify the locale */
    locale = "en",

    /** Specify the placeholder text */
    placeholder = "",

    /**
     * Override the sorting logic.
     * The default sorting compare the item text value.
     * Set to `false` to skip sorting and keep the original `items` order.
     * @type {((a: Item, b: Item) => number) | (() => void) | false}
     */
    sortItem = (a, b) => getSortCollator().compare(a.text, b.text),

    /**
     * Override the chevron icon label based on the open state.
     * Defaults to "Open menu" when closed and "Close menu" when open.
     * @type {((id: import("../ListBox/ListBoxMenuIcon.svelte").ListBoxMenuIconTranslationId) => string) | undefined}
     */
    translateWithId = undefined,

    /**
     * Override the label of the clear button when the input has a selection.
     * Defaults to "Clear selected item" and "Clear all items" if more than one item is selected.
     * @type {((id: import("../ListBox/ListBoxSelection.svelte").ListBoxSelectionTranslationId) => string) | undefined}
     */
    translateWithIdSelection = undefined,

    /**
     * Specify the label text, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    labelText = "",

    /** Set to `true` to pass the item to `itemToString` in the checkbox */
    useTitleInItem = false,

    /** Set to `true` to indicate an invalid state */
    invalid = false,

    /** Specify the invalid state text */
    invalidText = "",

    /** Set to `true` to indicate a warning state */
    warn = false,

    /** Specify the warning state text */
    warnText = "",

    /** Specify the helper text */
    helperText = "",

    /** Specify the text in the field of a multiselect that isn't filterable */
    label = "",

    /** Set to `true` to visually hide the label text */
    hideLabel = false,

    /**
     * Set an id for the field
     * @type {string}
     */
    id = fallbackId,

    /** Set to `true` to use the read-only variant */
    readonly = false,

    /**
     * Specify the assistive text announced to screen readers when read-only.
     * Exposed because VoiceOver does not announce `aria-readonly`.
     */
    readonlyText = "Read-only",

    /**
     * Specify the assistive text describing options disabled by `maxSelectedItems`.
     * Announced so screen reader users learn why an option refuses selection,
     * not just that it is disabled.
     */
    maxSelectedText = "Maximum items selected",

    /**
     * Specify the assistive text advertising the keyboard shortcut that clears
     * the selection. Appended to the field's visually-hidden description
     * whenever there is a selection to clear.
     */
    clearSelectionText = "To clear the selection, press Delete or Backspace",

    /**
     * Specify the assistive text for how many items are selected. Part of the
     * field's visually-hidden description, and of `readonlyText` when read-only.
     * @type {(count: number) => string}
     */
    selectionCountText = (count) => `${count} selected`,

    /**
     * Specify the assistive text announced through the status live region when
     * the selection is cleared via the keyboard or the clear button.
     */
    selectionClearedText = "All items cleared",

    /**
     * Set to `true` to reopen the dropdown menu after clearing the selection.
     * This allows users to immediately see all available items after clearing.
     */
    openOnClear = false,

    /**
     * Build the assistive message announced through the status live region when
     * typing in the filterable variant changes how many options match.
     * The count excludes any "select all" item.
     * @type {(count: number) => string}
     */
    filterResultsText = (count) =>
      count === 0
        ? "No results"
        : `${count} result${count === 1 ? "" : "s"} available`,

    /**
     * Specify the message shown in the open menu when no items match the
     * filter, or, without `filterable`, when `items` is empty.
     * Defaults to "No results" when `filterable` is `true` and "No options"
     * otherwise. Pass a function to build it from the typed value.
     * Set to `""` to show no message. When filterable, `filterResultsText`
     * still announces the result count; otherwise the status live region
     * announces this message, also when the `empty` snippet replaces it.
     * @type {undefined | string | ((value: string) => string)}
     */
    emptyText = undefined,

    /**
     * Default group name for the hidden inputs that mirror the current
     * selection for native form submission (`FormData`). Used per item
     * unless `itemToInput` returns its own `name`. Each input's value
     * defaults to the item `id` unless `itemToInput` returns a `value`.
     * Not applied to the
     * filterable text input, which is a query box, not the form value.
     * Omitted from submission when the multi-select is disabled.
     * @type {string | undefined}
     */
    name = undefined,

    /**
     * Set to `true` to require at least one selection. A wrapping `<form>`
     * blocks submission while no enabled item is selected, and the field
     * shows its invalid state with `requiredInvalidText` instead of the
     * browser's error bubble.
     */
    required = false,

    /**
     * Specify the invalid state text shown when a required multi-select
     * blocks submission. Cleared once an item is selected. `invalid` and
     * `invalidText` take precedence.
     */
    requiredInvalidText = "Select at least one item",

    /**
     * Obtain a reference to the filter input of a `filterable` multiselect.
     * @type {null | HTMLInputElement}
     */
    inputRef = $bindable(null),

    /**
     * Obtain a reference to the outer div element.
     * @type {null | HTMLDivElement}
     */
    multiSelectRef = $bindable(null),

    /**
     * Obtain a reference to the field button of a multiselect that isn't
     * filterable.
     * @type {null | HTMLButtonElement}
     */
    fieldRef = $bindable(null),

    /**
     * Obtain a reference to the clear button of the selection count.
     * @type {null | HTMLDivElement}
     */
    selectionRef = $bindable(null),

    /**
     * Id of the highlighted ListBoxMenuItem. Read-only: bind to read it.
     * @type {null | Item["id"]}
     */
    highlightedId = $bindable(null),

    /**
     * The post-sort, post-selection-feedback list of items rendered by the
     * dropdown. Read-only: bind to read the resolved order without
     * recomputing it from `items`, `selectedIds`, and `sortItem`.
     * @type {ReadonlyArray<Item & { checked: boolean }>}
     */
    sortedItems = $bindable([]),

    /**
     * Enable virtualization for large lists. Virtualization renders only the items currently visible in the viewport, improving performance for large lists.
     *
     * By default, virtualization is automatically enabled for lists with more than 100 items.
     *
     * Set `virtualize={false}` to explicitly disable virtualization, even for large lists.
     *
     * Set `virtualize={true}` to explicitly enable virtualization with default settings.
     *
     * Provide an object to customize virtualization behavior:
     * - `itemHeight` (default: size-based, or 64px for fluid unless `condensed`): Height of each item in pixels. Override when custom snippets change row height. Under `wrapOptions`, heights are measured from the rendered options and this serves as the starting estimate for ones not yet measured.
     * - `containerHeight` (default: 300): The maximum height in pixels of the dropdown container.
     * - `overscan` (default: 3): The number of extra items to render above and below the viewport for smoother scrolling. Higher values may cause more flickering during very fast scrolling.
     * - `threshold` (default: 100): The minimum number of items required before virtualization activates. Lists with fewer items will render all items normally without virtualization.
     * - `maxItems` (default: undefined): The maximum number of items to render. When undefined, all visible items are rendered.
     * - `optimizeFastScroll` (default: false): Keep the rendered options in view during very fast scrolling, such as a scrollbar drag, instead of showing blank space until new options render. The options then follow the scroll a frame behind, and pause while the main thread is busy.
     * @type {undefined | boolean | { itemHeight?: number, containerHeight?: number, overscan?: number, threshold?: number, maxItems?: number, optimizeFastScroll?: boolean }}
     */
    virtualize = undefined,

    /**
     * Set to `true` to show a loading row after the options while the menu is
     * open, such as while fetching more items on `onmenuscrollend`. Marks the
     * menu `aria-busy` and hides the empty state; the options stay interactive.
     */
    loading = false,

    /** Specify the text of the loading row */
    loadingText = "Loading...",

    /**
     * Wait this many milliseconds after `loading` turns `true` before showing
     * the loading row. Once shown, it stays for at least 500 ms, so fast work
     * shows nothing and slow work never flashes. The menu sets `aria-busy` and
     * holds back the empty state as soon as `loading` is `true`.
     * Set to `0` to show it at once.
     */
    loadingDelay = 0,

    /**
     * Set to `true` to let an option's label wrap onto as many lines as it needs
     * instead of being truncated with an ellipsis.
     * @type {boolean}
     */
    wrapOptions = false,

    /**
     * Set to `true` to always render the menu in a portal, or `false` to
     * keep it in place. Left unset, the menu moves to a portal inside a
     * Modal, or when a box around it (`overflow` other than `visible`)
     * would cut it off.
     * @type {boolean | undefined}
     */
    portalMenu = undefined,

    /**
     * Obtain a reference to the list HTML element.
     * @type {null | HTMLDivElement}
     */
    listRef = $bindable(null),

    /**
     * Called when the user opens or closes the menu. Not called when `open`
     * is set from outside.
     * @type {((detail: { open: boolean; trigger: "click" | "keydown" | "input" | "escape-key" | "outside-click" }) => void) | undefined}
     */
    onopenchange = undefined,

    /**
     * Called when the user changes the selection: by toggling an option,
     * a range, select-all, removing a tag, or clearing. Not called when
     * `selectedIds` is set from outside.
     * @type {((detail: { selectedIds: Item["id"][]; selected: Item[]; unselected: Item[] }) => void) | undefined}
     */
    onselectedchange = undefined,

    /**
     * Called when the user clears the selection, with the clear button or
     * Delete or Backspace, before `onselectedchange`.
     * @type {((detail: { trigger: "click" | "keydown" }) => void) | undefined}
     */
    onclear = undefined,

    /**
     * Called when the menu is scrolled near its end, such as to load more
     * items.
     * @type {((detail: { scrollTop: number; scrollHeight: number; clientHeight: number }) => void) | undefined}
     */
    onmenuscrollend = undefined,

    /**
     * Custom option content.
     * @type {import("svelte").Snippet<[{ item: Item; index: number; selected: boolean; highlighted: boolean }]> | undefined}
     */
    children: optionSnippet = undefined,

    /**
     * Custom group header content.
     * @type {import("svelte").Snippet<[{ group: string; items: ReadonlyArray<Item & { checked: boolean }> }]> | undefined}
     */
    group = undefined,

    /**
     * Custom content for a selected-item tag (`selectionDisplay="tags"`).
     * Spread `props` onto a `Tag` to keep its close button wired to the set.
     * @type {import("svelte").Snippet<[{ item: Item; index: number; props: { filter: boolean; disabled: boolean; value: Item["id"]; title: string; maxWidth: string } }]> | undefined}
     */
    tag = undefined,

    /**
     * Custom content for the empty state.
     * @type {import("svelte").Snippet<[{ value: string }]> | undefined}
     */
    empty = undefined,

    /**
     * An `AILabel` beside the field.
     * @type {import("svelte").Snippet | undefined}
     */
    decorator = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-label": ariaLabel = undefined,

    /** @type {string | undefined | null} */
    "aria-describedby": ariaDescribedBy = undefined,

    /** @type {string | undefined} */
    form = undefined,

    /** @type {((event: MouseEvent) => void) | undefined | null} */
    onclick = undefined,

    /** @type {((event: KeyboardEvent) => void) | undefined | null} */
    onkeydown = undefined,

    /** @type {((event: Event) => void) | undefined | null} */
    oninput = undefined,

    /** @type {((event: FocusEvent) => void) | undefined | null} */
    onfocus = undefined,

    /** @type {((event: FocusEvent) => void) | undefined | null} */
    onblur = undefined,

    ...rest
  } = $props();

  import { getContext, onMount, tick, untrack } from "svelte";
  import { writable } from "svelte/store";
  import Decorator from "../AILabel/Decorator.svelte";
  import InlineLoading from "../InlineLoading/InlineLoading.svelte";
  import HighlightSlot from "../ListBox/HighlightSlot.svelte";
  import ListBoxMenuGroup from "../ListBox/ListBoxMenuGroup.svelte";
  import ListBoxMenuStatus from "../ListBox/ListBoxMenuStatus.svelte";
  import ListBoxRequiredInput from "../ListBox/ListBoxRequiredInput.svelte";
  import {
    ListBox,
    ListBoxField,
    ListBoxMenu,
    ListBoxMenuIcon,
    ListBoxMenuItem,
    ListBoxSelection,
  } from "../ListBox/index.js";
  import {
    MENU_PAGE_STEP,
    shouldVirtualizeMenu,
  } from "../ListBox/list-box-utils.js";
  import {
    createGroupRows,
    hoistWithinGroups,
    orderByGroup,
    splitGroupRuns,
  } from "../ListBox/menu-groups.js";
  import {
    applyPostClearOptions,
    createMenuCloseHandler,
    createMenuOpenHandler,
    createStatusAnnouncer,
  } from "../ListBox/menu-status.js";
  import {
    createMenuWindow,
    scheduleHighlightScroll,
  } from "../ListBox/menu-window.js";
  import Tag from "../Tag/Tag.svelte";
  import TagSet from "../TagSet/TagSet.svelte";
  import VirtualWindow from "../VirtualList/VirtualWindow.svelte";
  import {
    FORM_CONTEXT_KEY,
    FORM_SIZE_CONTEXT_KEY,
    MODAL_CONTEXT_KEY,
  } from "../constants/context-keys.js";
  import WarningAltFilled from "../icons/WarningAltFilled.svelte";
  import WarningFilled from "../icons/WarningFilled.svelte";
  import { clampIndex } from "../utils/clamp-index.js";
  import { debounce } from "../utils/debounce.js";
  import { deepEqual } from "../utils/deep-equal.js";
  import { createLoadingIndicator } from "../utils/delayed-loading.js";
  import { dismiss } from "../utils/dismiss.svelte.js";
  import {
    buildFieldIds,
    joinDescribedBy,
    resolveStatusDescribedBy,
    resolveValidationVisibility,
  } from "../utils/field-status.js";
  import { fieldsetDisabled } from "../utils/fieldset-disabled.js";
  import { clippedBy } from "../utils/fit-align.js";
  import { formReset } from "../utils/form-reset.js";
  import { isImeComposition } from "../utils/ime-composition.js";
  import { isOutsideClick } from "../utils/is-outside-click.js";
  import { createScrollEndTracker } from "../utils/is-scroll-near-end.js";
  import { menuSide } from "../utils/menu-placement.js";
  import { moveIndex } from "../utils/move-index.js";
  import { overflowTitle } from "../utils/overflow-title.js";
  import { preserveFocusSelection } from "../utils/preserve-focus-selection.js";
  import { rangeSlice } from "../utils/range-slice.js";
  import { titleWhenTruncated } from "../utils/title-when-truncated.js";
  import {
    createTypeaheadBuffer,
    isTypeaheadKey,
    typeaheadIndex,
  } from "../utils/typeahead.js";
  import { resetVirtualScrollOnClose } from "../utils/virtualize.js";
  import { setMultiSelect } from "./multi-select-context.js";

  // A disabled `<fieldset>` around the component disables it too.
  let inDisabledFieldset = $state(false);
  const effectiveDisabled = $derived(disabled || inDisabledFieldset);

  const scrollEndTracker = createScrollEndTracker();
  const formContext = getContext(FORM_CONTEXT_KEY);
  /** @type {undefined | import("svelte/store").Readable<undefined | "xs" | "sm" | "md" | "xl">} */
  const formSize = getContext(FORM_SIZE_CONTEXT_KEY);
  const effectiveSize = $derived(size ?? $formSize);

  /**
   * Starts active for a filled snippet, so the server renders the AI surface.
   * `Decorator` clears it when no `AILabel` claims the snippet.
   * @type {import("svelte/store").Writable<undefined | "active" | "revert">}
   */
  const aiLabelState = writable(
    untrack(() => decorator) ? "active" : undefined,
  );
  const insideModal = getContext(MODAL_CONTEXT_KEY);

  // Set for one open when the in-place menu turns out to be cut off by a
  // box around it (a scrolling panel, an `overflow: hidden` card): the menu
  // moves to a portal instead. Only when `portalMenu` is left unset.
  let portalWhenClipped = $state(false);
  $effect.pre(() => {
    if (!open) portalWhenClipped = false;
  });

  const effectivePortalMenu = $derived(
    portalMenu === undefined ? !!insideModal || portalWhenClipped : portalMenu,
  );

  // In place, the menu opens on `direction`'s side unless it doesn't fit
  // there and the other side has more room; a portalled menu flips itself.
  // Measured once per open, after the menu renders and before it paints.
  /** @type {"top" | "bottom" | null} */
  let measuredSide = $state(null);
  const placement = $derived(measuredSide ?? direction);
  $effect.pre(() => {
    if (open && !effectivePortalMenu) {
      void direction;
      tick().then(placeMenu);
    } else {
      measuredSide = null;
    }
  });

  async function placeMenu() {
    if (!(open && listRef && fieldRef)) return;
    const mayPortal = portalMenu === undefined;
    if (mayPortal && clippedBy(listRef)) {
      portalWhenClipped = true;
      return;
    }
    const side = menuSide(fieldRef, listRef, direction);
    if (side === placement) return;
    measuredSide = side;
    await tick();
    if (mayPortal && open && listRef && clippedBy(listRef)) {
      portalWhenClipped = true;
    }
  }

  /** @type {string | undefined} */
  let sortCollatorLocale;
  /** @type {Intl.Collator | undefined} */
  let sortCollator;
  function getSortCollator() {
    if (!sortCollator || sortCollatorLocale !== locale) {
      sortCollatorLocale = locale;
      sortCollator = new Intl.Collator(locale, { numeric: true });
    }
    return sortCollator;
  }

  let fieldFocused = $state(false);
  /** Set when a required, empty multi-select blocked form submission. */
  let requiredError = $state(false);
  let highlightedIndex = $state(-1);
  let highlightOrigin = $state(/** @type {"keyboard" | null} */ (null));
  /** Row index (see `toRowIndex`) last scrolled into view. */
  let prevHighlightedIndex = -1;
  let listScrollTop = $state(0);
  /** Anchor item id for shift+click range selection; cleared when selection is reset entirely. */
  /** @type {any} */
  let prevSelectedItemId = null;
  /** Wrapper of the selected-item tags, for focus tracking. */
  /** @type {null | HTMLDivElement} */
  let selectedTagsRef = $state(null);
  /** Text content of the visually-hidden status live region. */
  let statusText = $state("");

  const menuWindow = createMenuWindow({
    getContainer: () => listRef,
    onScrollTop: (scrollTop) => {
      listScrollTop = scrollTop;
    },
    onState: (state) => {
      menuState = state;
    },
  });

  const typeahead = createTypeaheadBuffer();
  const buildGroupRows = createGroupRows();

  /**
   * Report a menu the user opened or closed. `"programmatic"` is the open
   * handler's name for an open that came from the `open` prop.
   * @param {"open" | "close"} event
   * @param {{ trigger: string }} detail
   */
  function reportOpenChange(event, { trigger }) {
    if (trigger === "programmatic") return;
    const cause =
      /** @type {"click" | "keydown" | "input" | "escape-key" | "outside-click"} */ (
        trigger
      );
    onopenchange?.({ open: event === "open", trigger: cause });
  }

  // `openMenu(trigger)` opens a closed menu and records the cause, which
  // `syncOpenEvent` reports once the menu has rendered.
  const { openMenu, sync: syncOpenEvent } = createMenuOpenHandler({
    getOpen: () => open,
    setOpen: (v) => (open = v),
    dispatch: reportOpenChange,
  });

  /**
   * Dismiss the menu and notify consumers of the cause. Guarded on `open` so a
   * dismissal gesture fired while already closed does not emit a phantom event.
   * @type {(trigger: "click" | "escape-key" | "outside-click") => void}
   */
  const close = createMenuCloseHandler({
    getOpen: () => open,
    setOpen: (v) => (open = v),
    dispatch: reportOpenChange,
  });

  setMultiSelect({
    declareRef({ key, ref }) {
      if (key === "field") fieldRef = /** @type {HTMLButtonElement} */ (ref);
      else selectionRef = /** @type {HTMLDivElement} */ (ref);
    },
    releaseRef({ key, ref }) {
      if (key === "field" && fieldRef === ref) fieldRef = null;
      if (key === "selection" && selectionRef === ref) selectionRef = null;
    },
  });

  /**
   * Whether an item should be treated as disabled for selection and keyboard nav.
   * Checked items stay enabled at the cap so they can be cleared.
   * @param {Item & { checked?: boolean }} item
   */
  function isItemDisabled(item) {
    if (item.disabled) return true;
    if (hasMaxSelectedItems && item.isSelectAll) return true;
    if (isAtSelectionCap && !item.checked) return true;
    return false;
  }

  /**
   * Run a user action that may change the checked items, then write the
   * selection to `selectedIds` and report it through `onselectedchange`.
   * @param {() => void} action
   */
  function changeSelection(action) {
    const before = selectedIds;
    action();
    const selected = entries.filter(
      (item) => item.checked && !item.isSelectAll,
    );
    const ids = selected.map((item) => item.id);
    if (ids.length === before.length && sameSelectedIds(ids, before)) return;
    selectedIds = ids;
    prevSelectedIds = ids.slice();
    onselectedchange?.({
      selectedIds: ids,
      selected,
      unselected: entries.filter((item) => !item.checked && !item.isSelectAll),
    });
  }

  /**
   * @param {MouseEvent} event
   * @param {Item & { checked: boolean }} item
   * @param {number} index Index into `itemsToUse`.
   * @param {boolean} itemDisabled
   */
  function handleOptionClick(event, item, index, itemDisabled) {
    if (itemDisabled) {
      event.stopPropagation();
      return;
    }
    // Label default synthesizes a second click; without this,
    // selectItem runs twice and the toggle nets to no change.
    event.preventDefault();
    changeSelection(() => {
      const usedRange =
        event.shiftKey &&
        prevSelectedItemId !== null &&
        !item.isSelectAll &&
        selectItemRange(index, !item.checked);
      if (!usedRange) selectItem(item);
    });
    prevSelectedItemId = item.id;
  }

  /**
   * Select the item keyboard-highlighted at `index` (into `itemsToUse`), or
   * with `shiftKey` select the range from the anchor to it, matching
   * shift+click (`handleOptionClick`). Ignored unless the highlight came
   * from the keyboard.
   * @param {number} index
   * @param {boolean} shiftKey
   */
  function selectHighlightedItem(index, shiftKey) {
    if (highlightOrigin !== "keyboard" || index < 0) return;
    const item = itemsToUse[index];
    if (!item) return;
    changeSelection(() => {
      const usedRange =
        shiftKey &&
        prevSelectedItemId !== null &&
        !item.isSelectAll &&
        selectItemRange(index, !item.checked);
      if (!usedRange) selectItem(item);
    });
    prevSelectedItemId = item.id;
  }

  /** @param {number} step */
  function change(step) {
    // Disabled options stay in the keyboard navigation sequence (APG:
    // "Focusability of disabled controls") so assistive-tech users can
    // discover them; selectItem and the option click handlers refuse the
    // actual selection.
    //
    // `filteredItems` is gated on `open`, so right after a handler opens the
    // menu it can still be empty. Fall back to `entries` then, matching
    // ComboBox's `filteredItems?.length ? filteredItems : items` guard.
    const navigableItems = filteredItems.length ? filteredItems : entries;
    highlightedIndex = moveIndex(highlightedIndex, step, navigableItems.length);
    highlightOrigin = "keyboard";
  }

  /**
   * Move the highlight a page of options (PageUp/PageDown), stopping at the
   * ends instead of wrapping.
   * @param {1 | -1} direction
   */
  function changePage(direction) {
    const navigableItems = filteredItems.length ? filteredItems : entries;
    highlightedIndex = clampIndex(
      highlightedIndex,
      direction * MENU_PAGE_STEP,
      navigableItems.length,
    );
    highlightOrigin = "keyboard";
  }

  /**
   * Move the (keyboard) highlight to the next enabled item whose text starts
   * with the accumulating typed characters, wrapping once. Only wired for
   * the non-filterable field, since the filterable text input filters as
   * you type. Matches Dropdown's `typeaheadSearch`: it moves the highlight,
   * it never selects.
   * @param {string} character
   */
  function typeaheadSearch(character) {
    if (itemsToUse.length === 0) return;

    const query = typeahead.push(character);

    highlightedIndex = typeaheadIndex({
      items: itemsToUse,
      query,
      itemToString,
      index: highlightedIndex,
    });
    highlightOrigin = "keyboard";
  }

  /**
   * Sync the isSelectAll pseudo-item's checked state to whether every
   * selectable item is checked.
   */
  function syncSelectAllItem() {
    if (!hasSelectAll) return;

    // Computed from `entries` as it stands, which the callers have just
    // replaced.
    const scope =
      filterable && open
        ? entries.filter(
            (sortedItem) =>
              sortedItem.isSelectAll || filterItem(sortedItem, value),
          )
        : entries;
    const selectable = scope.filter(
      (sortedItem) => !sortedItem.disabled && !sortedItem.isSelectAll,
    );
    const newSelectableChecked = selectable.filter(
      (sortedItem) => sortedItem.checked,
    ).length;
    const newAllSelected =
      selectable.length > 0 && newSelectableChecked === selectable.length;
    const selectAllIndex = entries.findIndex(
      (sortedItem) => sortedItem.isSelectAll,
    );
    if (
      selectAllIndex !== -1 &&
      entries[selectAllIndex].checked !== newAllSelected
    ) {
      const next = entries.slice();
      next[selectAllIndex] = {
        ...entries[selectAllIndex],
        checked: newAllSelected,
      };
      entries = next;
    }
  }

  /**
   * Mirror an external `selectedIds` change onto the checked state in place,
   * without reordering, for the modes that defer re-sorting.
   */
  function syncCheckedFromSelectedIds() {
    const ids = new Set(selectedIds);
    entries = entries.map((entry) =>
      entry.isSelectAll || entry.checked === ids.has(entry.id)
        ? entry
        : { ...entry, checked: ids.has(entry.id) },
    );
    syncSelectAllItem();
  }

  /** Apply `selectionFeedback: "top"` bookkeeping after a checked-state change. */
  function applyTopSelectionFeedback() {
    if (selectionFeedback !== "top") return;

    selectedIds = entries
      .filter((sortedItem) => sortedItem.checked && !sortedItem.isSelectAll)
      .map((sortedItem) => sortedItem.id);
    prevSelectedIds = selectedIds.slice();
    entries = sort();
  }

  /**
   * Set every non-disabled item within `selectAllScope` to `checked`
   * (including the isSelectAll pseudo-item, if present, so its own checkbox
   * follows along without a separate `syncSelectAllItem()` call). Shared by
   * the isSelectAll pseudo-item's toggle and Ctrl+A.
   * @param {boolean} checked
   */
  function setSelectAllScopeChecked(checked) {
    entries = entries.map((sortedItem) =>
      !selectAllScopeIds.has(sortedItem.id) ||
      sortedItem.disabled ||
      sortedItem.checked === checked
        ? sortedItem
        : { ...sortedItem, checked },
    );
  }

  /**
   * Deselect the item behind a closed tag. Updates `selectedIds` along with
   * the checked state, as `clear()` does: with the menu closed,
   * `top-after-reopen` re-sorts from `selectedIds`, which would otherwise
   * restore the check.
   * @param {{ tag: { value?: string | number } }} detail
   */
  function handleTagClose(detail) {
    if (effectiveDisabled || readonly) return;
    const id = detail.tag.value;
    const entry = entries.find((item) => item.id === id);
    if (!entry?.checked || entry.disabled) return;

    const hadFocus = selectedTagsRef?.contains(document.activeElement);
    changeSelection(() => {
      selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
      prevSelectedIds = selectedIds.slice();
      entries = entries.map((item) =>
        item.id === id ? { ...item, checked: false } : item,
      );
      syncSelectAllItem();
    });

    // With no tag left to take focus, hand it back to the field. `TagSet`
    // moves focus to a neighbouring tag otherwise.
    if (hadFocus && selectedIds.length === 0) {
      tick().then(() => (filterable ? inputRef : fieldRef)?.focus());
    }
  }

  /**
   * Toggle an item, including isSelectAll logic.
   * @param {Item & { checked: boolean }} item
   */
  function selectItem(item) {
    // Read-only allows opening and navigating the menu to review values, but
    // never changing them. Guarding here covers every path (click, Enter,
    // label click, select-all) so callers don't each need a readonly check.
    if (readonly || isItemDisabled(item)) return;

    if (item.isSelectAll) {
      setSelectAllScopeChecked(!allSelected);
    } else {
      const itemIndex = entries.indexOf(item);
      if (itemIndex !== -1) {
        const next = entries.slice();
        next[itemIndex] = { ...item, checked: !item.checked };
        entries = next;
      }
      syncSelectAllItem();
    }

    applyTopSelectionFeedback();
  }

  /**
   * Select or deselect every selectable item currently in scope (filtered
   * when `filterable` and `open`), toggling to the opposite of `allSelected`.
   * Same semantics as clicking the isSelectAll pseudo-item, whether or not
   * `items` declares one. Bound to Ctrl+A in
   * the non-filterable field; the filterable text input intentionally never
   * calls this so native text selection (Ctrl+A on the input) keeps working.
   */
  function selectAllViaKeyboard() {
    if (readonly || hasMaxSelectedItems || selectableItems.length === 0) {
      return;
    }
    changeSelection(() => {
      setSelectAllScopeChecked(!allSelected);
      applyTopSelectionFeedback();
    });
  }

  /**
   * Apply `checked` to every selectable item between the anchor item and `targetIndex`
   * (inclusive), where `targetIndex` is a position in `itemsToUse`. Returns `false` if the
   * anchor item is no longer present (for example, filtered out), so the caller can fall
   * back to a single toggle.
   * @type {(targetIndex: number, checked: boolean) => boolean}
   */
  function selectItemRange(targetIndex, checked) {
    if (readonly) return false;

    const anchorIndex = itemsToUse.findIndex(
      (item) => item.id === prevSelectedItemId,
    );
    const eligible = rangeSlice(
      itemsToUse,
      anchorIndex,
      targetIndex,
      (item) => !item.isSelectAll && !isItemDisabled(item),
    );
    if (eligible === null) return false;

    let changed = eligible.filter((item) => item.checked !== checked);
    if (checked && hasMaxSelectedItems) {
      // Fill from the anchor toward the target, stopping at the cap.
      if (anchorIndex > targetIndex) changed.reverse();
      changed = changed.slice(
        0,
        Math.max(0, /** @type {number} */ (maxSelectedItems) - selectionCount),
      );
    }
    const rangeIds = new Set(changed.map((item) => item.id));

    entries = entries.map((sortedItem) =>
      rangeIds.has(sortedItem.id) && sortedItem.checked !== checked
        ? { ...sortedItem, checked }
        : sortedItem,
    );

    syncSelectAllItem();
    applyTopSelectionFeedback();

    return true;
  }

  const announceStatus = createStatusAnnouncer((text) => (statusText = text));

  /**
   * Clear the multiselect selection programmatically. Calls no callbacks.
   * By default, focuses the multiselect after clearing. Set `options.focus` to `false` to prevent focusing.
   * Set `options.open` to `true` to open the dropdown menu after clearing.
   * @type {(options?: { focus?: boolean; open?: boolean; }) => Promise<void>}
   * @example
   * ```svelte
   * <MultiSelect bind:this={multiSelect} items={items} />
   * <button onclick={() => multiSelect.clear()}>Clear</button>
   * ```
   */
  export async function clear(options = {}) {
    if (readonly || selectionCount === 0) return;
    selectedIds = [];
    prevSelectedIds = [];
    prevSelectedItemId = null;
    entries = entries.map((item) => ({ ...item, checked: false }));
    announceStatus(selectionClearedText);
    await applyPostClearOptions(
      options,
      (v) => (open = v),
      () => (filterable ? inputRef : fieldRef),
    );
  }

  /**
   * Clear the selection as the user, with the clear button or the keyboard.
   * @param {"click" | "keydown"} trigger
   */
  function clearByUser(trigger) {
    if (readonly || selectionCount === 0) return;
    onclear?.({ trigger });
    changeSelection(() => {
      clear({ open: openOnClear });
    });
  }

  /** Filter result count last announced; null when the menu is closed so reopening announces again. */
  /** @type {number | null} */
  let announcedFilterCount = null;

  const announceFilterResults = debounce((/** @type {number} */ count) => {
    if (count === announcedFilterCount) return;
    announcedFilterCount = count;
    announceStatus(filterResultsText(count));
  }, 800);

  onMount(() => {
    return () => {
      announceFilterResults.cancel();
      typeahead.clear();
      menuWindow.destroy();
      loadingIndicator.cancel();
    };
  });

  // `loading` takes effect at once for `aria-busy` and the empty state. Only
  // the indicator waits for `loadingDelay`; with no delay it follows `loading`
  // exactly.
  let showLoading = $state(untrack(() => loading));
  const loadingIndicator = createLoadingIndicator(
    (/** @type {boolean} */ shown) => {
      showLoading = shown;
    },
  );
  $effect(() => {
    loadingIndicator(loading, loadingDelay);
  });

  /**
   * Row position of the option at `index` in `itemsToUse`. Group headers are
   * rows too, so the two differ once items are grouped.
   * @param {number} index
   * @returns {number}
   */
  function toRowIndex(index) {
    return groupRows && index >= 0 ? groupRows.rowIndexByItem[index] : index;
  }

  /** @param {Event} event */
  function handleMenuScroll(event) {
    const target = /** @type {HTMLElement} */ (event.target);
    listScrollTop = target.scrollTop;
    menuWindow.noteScroll(target.scrollTop);
    const detail = scrollEndTracker.observe({
      scrollTop: target.scrollTop,
      scrollHeight: target.scrollHeight,
      clientHeight: target.clientHeight,
      itemCount: itemsToUse.length,
    });
    if (detail) onmenuscrollend?.(detail);
  }

  /**
   * Alphabetical order depends only on `items` and `sortItem`, never on
   * `selectedIds`, so it's cached across `sort()` calls that only change
   * selection (a toggle, an external `selectedIds` change, a close with
   * `top-after-reopen`). Keyed on `items` reference: `sort()` only runs for
   * a genuinely different `items` value (see `isAlreadySorted`), so a
   * reference change here always means the order needs recomputing.
   *
   * `sortItem` is intentionally NOT part of the cache key: a new `sortItem`
   * function does nothing until some other change forces a re-sort (define
   * it outside the markup, as with `filterItem`).
   */
  /** @type {ReadonlyArray<Item> | undefined} */
  let baseOrderItems;
  /** @type {any[]} */
  let baseOrderPairs = [];
  function getBaseOrderPairs() {
    if (baseOrderItems === items) return baseOrderPairs;

    const regularItems = items.filter((item) => !item.isSelectAll);
    const regularSnapshots = prevItemsSnapshot.filter(
      (item) => !item.isSelectAll,
    );
    const pairs = regularItems.map((item, index) => ({
      item,
      snapshot: regularSnapshots[index],
    }));

    baseOrderItems = items;
    baseOrderPairs = orderByGroup(
      pairs,
      (pair) => pair.item.group,
      sortItem === false
        ? undefined
        : (a, b) => /** @type {number} */ (sortItem(a.item, b.item)),
    );
    return baseOrderPairs;
  }

  /** @returns {Array<Item & { checked: boolean }>} */
  function sort() {
    const selectedIdsSet = new Set(selectedIds);

    const regularItems = items.filter((item) => !item.isSelectAll);
    const selectAllItems = items.filter((item) => item.isSelectAll);
    const selectAllSnapshots = prevItemsSnapshot.filter(
      (item) => item.isSelectAll,
    );
    const enabledRegularItems = regularItems.filter((item) => !item.disabled);
    const allChecked =
      enabledRegularItems.length > 0 &&
      enabledRegularItems.every((item) => selectedIdsSet.has(item.id));

    // Reuse the previous entry object for `item` when nothing about it
    // changed, so a keyed `{#each}` block sees the same reference and skips
    // re-evaluating that option. `snapshot` is the value `item` had the last
    // time `entries` was rebuilt (positionally paired via `items`'s
    // filtered order, not by id, so it also catches an in-place mutation
    // handed back under the same id).
    const prevById = indexById(entries);
    /**
     * @param {Item} item
     * @param {Item | undefined} snapshot
     * @param {boolean} checked
     */
    const reuseOrBuildEntry = (item, snapshot, checked) => {
      const bucket = prevById.get(item.id);
      const prev = bucket?.[0];
      if (
        prev &&
        prev.checked === checked &&
        snapshot !== undefined &&
        deepEqual(snapshot, item)
      ) {
        bucket?.shift();
        return prev;
      }
      return { ...item, checked };
    };

    const selectAllEntries = selectAllItems.map((item, index) =>
      reuseOrBuildEntry(item, selectAllSnapshots[index], allChecked),
    );

    const regularEntries = getBaseOrderPairs().map(({ item, snapshot }) =>
      reuseOrBuildEntry(item, snapshot, selectedIdsSet.has(item.id)),
    );

    if (
      selectionFeedback === "top" ||
      selectionFeedback === "top-after-reopen"
    ) {
      // Stable partition of the cached base order: checked entries first
      // within each group. Zero comparator calls, and equivalent to sorting
      // checked and unchecked separately because the base order is already
      // sorted by the same comparator and `Array.prototype.sort` is stable.
      return [
        ...selectAllEntries,
        ...hoistWithinGroups(regularEntries, (entry) => entry.checked),
      ];
    }

    return [...selectAllEntries, ...regularEntries];
  }

  // Shallow copies, so an item mutated in place and handed over in a new
  // array still reads as changed. Declared before the first `sort()` call,
  // which reads it to decide whether an entry can be reused.
  /** @type {Item[]} */
  let prevItemsSnapshot = untrack(() => items.map((item) => ({ ...item })));
  /** @type {ReadonlyArray<Item>} */
  let prevItems = untrack(() => items);
  // A copy, not the prop reference: `sameSelectedIds` value-compares against
  // this, and a live reference would silently track any in-place mutation a
  // consumer made to the array it previously handed over.
  /** @type {ReadonlyArray<Item["id"]>} */
  let prevSelectedIds = [];
  /**
   * The menu entries: `items` sorted, each with its checked state. Mirrored
   * to the read-only `sortedItems` binding.
   * @type {ReadonlyArray<Item & { checked: boolean }>}
   */
  let entries = $state.raw([]);
  $effect.pre(() => {
    sortedItems = entries;
  });
  untrack(() => {
    entries = sort();
    // The bound `selectedIds` follows the checked items from the start, in
    // menu order and without ids that match no item.
    const checkedIds = entries
      .filter((item) => item.checked && !item.isSelectAll)
      .map((item) => item.id);
    if (entries.some((item) => item.checked)) selectedIds = checkedIds;
    prevSelectedIds = selectedIds.slice();
  });

  /**
   * Whether `entries` already describes `nextItems` and `nextSelectedIds`,
   * so sorting again would only rebuild every option for the same result.
   * @type {(nextItems: typeof items, nextSelectedIds: typeof selectedIds) => boolean}
   */
  function isAlreadySorted(nextItems, nextSelectedIds) {
    if (!deepEqual(prevItemsSnapshot, nextItems)) return false;

    const checkedIds = new Set();
    for (const item of entries) {
      if (item.checked && !item.isSelectAll) checkedIds.add(item.id);
    }

    return sameIdSet(nextSelectedIds, checkedIds);
  }

  // New `items`: rebuild the menu entries, reusing unchanged ones.
  $effect.pre(() => {
    const next = items;
    untrack(() => {
      if (next === prevItems) return;
      prevItems = next;
      if (!isAlreadySorted(next, selectedIds)) {
        // `sort()` reads the OLD `prevItemsSnapshot` to decide which entries
        // changed, so it must run before the snapshot is refreshed to match
        // the new `items` — otherwise every entry would compare equal to its
        // own just-taken snapshot and get stale-reused.
        entries = sort();
        prevItemsSnapshot = next.map((item) => ({ ...item }));
      }
    });
  });

  // A `selectedIds` set from outside, or a close under `top-after-reopen`:
  // re-sort, or mirror the checked state in place for the modes that keep
  // the order.
  $effect.pre(() => {
    const ids = selectedIds;
    const feedback = selectionFeedback;
    const isOpen = open;
    untrack(() => {
      if (!ids) return;
      const external = !sameSelectedIds(ids, prevSelectedIds);
      if (
        (feedback === "top" && external) ||
        (feedback === "top-after-reopen" && isOpen === false)
      ) {
        prevSelectedIds = ids.slice();
        entries = sort();
      } else if (external) {
        prevSelectedIds = ids.slice();
        syncCheckedFromSelectedIds();
      }
    });
  });

  const fieldIds = $derived(buildFieldIds(id));
  const helperId = $derived(/** @type {string} */ (fieldIds.helperId));
  const errorId = $derived(/** @type {string} */ (fieldIds.errorId));
  const warnId = $derived(/** @type {string} */ (fieldIds.warnId));
  const readonlyId = $derived(/** @type {string} */ (fieldIds.readonlyId));
  const menuId = $derived(`menu-${id}`);
  const comboId = $derived(`combo-${id}`);
  const selectionId = $derived(`selection-${id}`);
  const maxSelectedId = $derived(`max-selected-${id}`);

  const inline = $derived(type === "inline");
  const isFluid = $derived(!inline && (fluid || !!formContext?.isFluid));
  // Keep the focus outline on the field while the menu is open, not just while
  // the field itself is focused: selecting an item bounces focus to the option
  // and back, which would otherwise drop the outline mid-interaction.
  const showFluidFieldFocus = $derived(isFluid && (fieldFocused || open));
  const showFieldFocus = $derived(!isFluid && (fieldFocused || open));
  // Fluid (non-condensed) menu items are 64px tall (see css/_fluid-list-box.scss).
  // Portaled menus render outside the fluid wrapper, so they keep default heights.
  const hasFluidMenuItems = $derived(
    isFluid && !condensed && !effectivePortalMenu,
  );

  const hasSelectAll = $derived(items.some((item) => item.isSelectAll));
  const checked = $derived(entries.filter((item) => item.checked));
  // Native form participation, decoupled from what's rendered: derived from
  // `items` + `selectedIds` directly (in `items` order), never
  // `entries`/`checked` (whose order shifts with `selectionFeedback`),
  // `filteredItems`, or the virtual window. Excludes the isSelectAll
  // pseudo-item and disabled items (matching native disabled checkboxes,
  // which never submit). A disabled MultiSelect disables the hidden inputs
  // themselves, so the field is omitted entirely, like a disabled native
  // control.
  const selectedIdsSet = $derived(new Set(selectedIds));
  const formItems = $derived(
    items.filter(
      (item) =>
        !item.isSelectAll && !item.disabled && selectedIdsSet.has(item.id),
    ),
  );
  // Tags in `items` order, so they don't jump as `selectionFeedback`
  // reorders the menu. Disabled selected items show as disabled tags.
  const selectedTagItems = $derived(
    selectionDisplay === "tags"
      ? items.filter((item) => !item.isSelectAll && selectedIdsSet.has(item.id))
      : [],
  );
  /** @type {"xs" | "sm" | "default"} */
  const tagSize = $derived(
    effectiveSize === "xs" || effectiveSize === "sm"
      ? effectiveSize
      : "default",
  );
  const filteredItems = $derived(
    filterable && open
      ? entries.filter((item) => item.isSelectAll || filterItem(item, value))
      : [],
  );
  // Scope select-all to the currently visible (filtered) items, so it
  // doesn't check/uncheck items hidden by an active filter.
  const selectAllScope = $derived(filterable && open ? filteredItems : entries);
  const selectAllScopeIds = $derived(
    new Set(selectAllScope.map((item) => item.id)),
  );
  const selectableItems = $derived(
    selectAllScope.filter((item) => !item.disabled && !item.isSelectAll),
  );
  const selectableCheckedCount = $derived(
    selectableItems.filter((item) => item.checked).length,
  );
  const allSelected = $derived(
    selectableItems.length > 0 &&
      selectableCheckedCount === selectableItems.length,
  );
  const selectAllIndeterminate = $derived(
    hasSelectAll && selectableCheckedCount > 0 && !allSelected,
  );
  const selectionCount = $derived(
    hasSelectAll
      ? checked.filter((item) => !item.isSelectAll).length
      : checked.length,
  );
  const hasMaxSelectedItems = $derived(
    typeof maxSelectedItems === "number" && maxSelectedItems > 0,
  );
  const isAtSelectionCap = $derived(
    hasMaxSelectedItems &&
      selectionCount >= /** @type {number} */ (maxSelectedItems),
  );
  const filterResultCount = $derived(
    filteredItems.filter((item) => !item.isSelectAll).length,
  );

  // Invalid/warn states are suppressed when the multi-select is disabled or read-only.
  $effect.pre(() => {
    if (!required || formItems.length > 0) requiredError = false;
  });
  const shownInvalidText = $derived(
    requiredError && !invalid ? requiredInvalidText : invalidText,
  );
  const validation = $derived(
    resolveValidationVisibility({
      invalid: invalid || requiredError,
      warn,
      disabled: effectiveDisabled,
      readonly,
    }),
  );
  const showInvalid = $derived(validation.showInvalid);
  const showWarn = $derived(validation.showWarn);
  // `aria-readonly` on a combobox/listbox does not reliably surface read-only state,
  // so the read-only state is also exposed as a visually-hidden description. The
  // single status/help id is combined with the read-only id (a describedby
  // may reference multiple ids) so it works in every state.
  const statusDescribedById = $derived(
    resolveStatusDescribedBy({
      showInvalid,
      showWarn,
      helperText,
      invalidText: shownInvalidText,
      warnText,
      isFluid,
      errorId,
      warnId,
      helperId,
    }),
  );
  const hasSelectionDescription = $derived(!readonly && selectionCount > 0);
  const fieldDescribedById = $derived(
    joinDescribedBy(
      readonly ? readonlyId : null,
      hasSelectionDescription ? selectionId : null,
      statusDescribedById,
    ),
  );
  // The selection count badge is hidden from assistive tech in read-only.
  // Fold the count into the read-only description so the
  // collapsed field still announces how much there is to review.
  const readonlyDescription = $derived(
    selectionCount > 0
      ? `${readonlyText}, ${selectionCountText(selectionCount)}`
      : readonlyText,
  );
  // A MultiSelect that turns disabled while open closes its menu, so no
  // option stays clickable. A read-only menu stays open for review. Closing
  // here is not a dismissal, so `onopenchange` isn't called.
  $effect.pre(() => {
    if (effectiveDisabled && open) open = false;
  });
  // Neutral = default fluid state, i.e. none of the other wrapper modifiers apply.
  const fluidNeutral = $derived(
    isFluid && !showInvalid && !showWarn && !effectiveDisabled && !readonly,
  );
  // Hoverable = disabled/readonly do not suppress the invalid/warning hover
  // tint. showInvalid/showWarn already exclude both, so this only matters
  // for readability of the selector it replaces.
  const fluidHoverable = $derived(isFluid && !effectiveDisabled && !readonly);

  $effect(() => {
    if (filterable && open && value?.length > 0) {
      announceFilterResults(filterResultCount);
    } else {
      announceFilterResults.cancel();
    }
  });
  $effect.pre(() => {
    if (!open) {
      announcedFilterCount = null;
      statusText = "";
    }
  });
  // Without a filter, only an empty `items` list (a select-all item aside)
  // leaves nothing to show, such as before async options arrive.
  const hasNoMatches = $derived(
    open &&
      !loading &&
      (filterable
        ? filterResultCount === 0
        : items.every((item) => item.isSelectAll)),
  );
  const emptyMessage = $derived(
    hasNoMatches
      ? typeof emptyText === "function"
        ? emptyText(value)
        : (emptyText ?? (filterable ? "No results" : "No options"))
      : "",
  );
  // A row after the options, not an option, so arrow keys never reach it.
  const showEmpty = $derived(
    hasNoMatches && (empty !== undefined || emptyMessage !== ""),
  );
  // The row is hidden from assistive tech. Filtering announces its result
  // count; without a filter, the live region carries the message instead.
  $effect(() => {
    if (hasNoMatches && !filterable && emptyMessage) {
      const message = emptyMessage;
      untrack(() => announceStatus(message));
    }
  });

  const highlightedItemId = $derived(
    highlightedIndex > -1
      ? ((filterable ? filteredItems : entries)[highlightedIndex]?.id ?? null)
      : null,
  );
  $effect.pre(() => {
    highlightedId = highlightedItemId;
  });
  const activeDescendantId = $derived(
    highlightedItemId == null ? null : `${id}-${highlightedItemId}`,
  );

  const shouldVirtualize = $derived(
    shouldVirtualizeMenu({ items, virtualize }),
  );

  const itemsToUse = $derived(filterable ? filteredItems : entries);
  $effect.pre(() => {
    scrollEndTracker.noteItemCount(itemsToUse.length);
  });

  const grouped = $derived(items.some((item) => !!item.group));
  // Group headers render as rows of their own, so the menu window indexes
  // rows, not items. `toRowIndex` maps between the two.
  const groupRows = $derived(
    grouped && open ? buildGroupRows(itemsToUse) : null,
  );
  const menuRows = $derived(groupRows ? groupRows.rows : itemsToUse);

  // Measurement can move the window after the options render; `onState`
  // writes that over this until the next update.
  /** @type {import("../ListBox/menu-window.js").MenuWindowState} */
  let menuState = $derived(
    menuWindow.update({
      items: menuRows,
      getKey: (/** @type {{ id: any }} */ row) => row.id,
      shouldVirtualize,
      virtualize,
      // A header is not as tall as an option, so a grouped menu measures its
      // rows the way a menu of wrapped options does.
      wrapOptions: wrapOptions || grouped,
      size: effectiveSize,
      fluid: hasFluidMenuItems,
      scrollTop: listScrollTop,
    }),
  );
  // Each group's rendered rows sit inside one `role="group"` element.
  const menuRuns = $derived(
    splitGroupRuns(
      menuState.itemsToRender,
      menuState.isVirtualized ? menuState.startIndex : 0,
      groupRows,
    ),
  );

  // After each render: report an opened menu, reset the highlight on close,
  // scroll the highlight or the selection into view, and let the menu
  // window measure the options it now renders.
  let prevOpen = untrack(() => open);
  $effect(() => {
    const isOpen = open;
    const rowIndex = toRowIndex(highlightedIndex);
    const virtualized = shouldVirtualize;
    const list = listRef;
    void menuState;
    untrack(() => {
      syncOpenEvent();

      if (!isOpen) {
        highlightedIndex = -1;
        highlightOrigin = null;
        prevHighlightedIndex = -1;
        typeahead.clear();
        if (prevOpen && filterable) value = "";
      }

      prevHighlightedIndex = scheduleHighlightScroll({
        open: isOpen,
        shouldVirtualize: virtualized,
        highlightedIndex: rowIndex,
        prevHighlightedIndex,
        listRef: list,
        menuWindow,
      });

      // Scroll to the first selected item when a virtualized menu opens.
      if (isOpen && !prevOpen && virtualized && list) {
        tick().then(() => {
          if (!listRef) return;
          // Against `itemsToUse`, the rendered list, which sorting and filtering
          // can order differently from `items`.
          const selectedIndex =
            selectedIds && selectedIds.length > 0
              ? itemsToUse.findIndex((item) => item.id === selectedIds[0])
              : -1;
          const row = toRowIndex(selectedIndex);
          // Keep the group header in view above the first option of a group.
          menuWindow.scrollIntoView(
            groupRows?.itemIndexByRow[row - 1] === -1 ? row - 1 : row,
            "top",
          );
        });
      }
      const justClosed = !isOpen && prevOpen;
      prevOpen = isOpen;

      menuWindow.sync();

      // Reset scroll position when menu closes
      if (justClosed && virtualized) {
        listScrollTop = resetVirtualScrollOnClose();
        if (listRef) listRef.scrollTop = listScrollTop;
      }
      if (!isOpen) {
        scrollEndTracker.reset();
        menuWindow.reset();
      }
    });
  });

  /** @param {Event} event */
  function handleOutsideInteraction(event) {
    if (
      open &&
      isOutsideClick(event, [multiSelectRef, effectivePortalMenu && listRef])
    ) {
      close("outside-click");
    }
  }

  /**
   * A form reset unchecks the option checkboxes, but the selection lives in
   * the items. Put each box back to the state its option announces.
   */
  function handleOptionFormReset() {
    if (!listRef) return;
    for (const option of listRef.querySelectorAll('[role="option"]')) {
      /** @type {HTMLInputElement | null} */
      const input = option.querySelector('input[type="checkbox"]');
      if (input)
        input.checked = option.getAttribute("aria-selected") === "true";
    }
  }

  /**
   * Title an option label while its text overflows. Measures the label
   * text span, which is the element that truncates.
   * @param {HTMLElement} node
   * @param {string | undefined} title
   */
  function optionOverflowTitle(node, title) {
    const measure = /** @type {HTMLElement | null} */ (node.firstElementChild);
    const action = overflowTitle(node, { title, measure });
    return {
      update: (/** @type {string | undefined} */ next) =>
        action.update({ title: next, measure }),
      destroy: action.destroy,
    };
  }

  /** @param {KeyboardEvent} event */
  function handleInputKeydown(event) {
    onkeydown?.(event);
    // ListBox decides whether Escape propagates.
    if (event.key !== "Escape") event.stopPropagation();
    // Keys that belong to an IME composition (Enter commits, Escape
    // cancels, arrows pick a candidate) are not menu keys.
    if (isImeComposition(event)) return;
    // Read-only opens and navigates the menu to review values, but the
    // keys that clear the selection are blocked; selectItem guards the
    // rest (Enter/option toggle).
    if (readonly && (event.key === "Backspace" || event.key === "Delete")) {
      return;
    }
    if (event.key === "Enter") {
      selectHighlightedItem(highlightedIndex, event.shiftKey);
    } else if (event.key === "Tab") {
      // Tab dismisses without selecting; report it as a keyboard
      // dismissal, like Dropdown and ComboBox.
      close("escape-key");
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      if (event.altKey) {
        // APG combobox pattern: Alt+ArrowDown opens a closed menu
        // without moving the highlight; Alt+ArrowUp closes an open one.
        if (event.key === "ArrowDown" && !open) {
          openMenu("keydown");
        } else if (event.key === "ArrowUp" && open) {
          close("escape-key");
        }
      } else {
        openMenu("keydown");
        change(step);
      }
    } else if (open && (event.key === "PageUp" || event.key === "PageDown")) {
      // APG listbox: jump a page of options; a closed menu keeps the default.
      event.preventDefault();
      changePage(event.key === "PageDown" ? 1 : -1);
    } else if (event.key === "Escape") {
      close("escape-key");
    } else if (event.key === " ") {
      if (readonly) event.preventDefault();
      openMenu("keydown");
    } else if (event.key === "Backspace" && value === "") {
      clearByUser("keydown");
    } else if (event.key === "Delete") {
      value = "";
      if (!open) clearByUser("keydown");
    }
  }

  /** @param {KeyboardEvent} event */
  function handleFieldKeydown(event) {
    onkeydown?.(event);
    // The field is only aria-disabled, so a click can still focus it.
    if (effectiveDisabled) return;
    if (
      event.key === " " ||
      event.key === "Enter" ||
      event.key === "ArrowUp" ||
      event.key === "ArrowDown"
    ) {
      // Prevent the native button from synthesizing a click (which would
      // toggle the menu) so these keys are handled solely below.
      event.preventDefault();
    }
    // Read-only still opens and navigates the menu; selectItem is the
    // single guard that blocks the actual selection change.
    if (event.key === " ") {
      if (open) {
        selectHighlightedItem(highlightedIndex, event.shiftKey);
      } else {
        openMenu("keydown");
      }
    } else if (event.key === "Tab") {
      // Tab dismisses without selecting; report it as a keyboard
      // dismissal, like Dropdown and ComboBox.
      close("escape-key");
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const step = event.key === "ArrowDown" ? 1 : -1;
      if (event.altKey) {
        // APG combobox pattern: Alt+ArrowDown opens a closed menu
        // without moving the highlight; Alt+ArrowUp closes an open one.
        if (event.key === "ArrowDown" && !open) {
          openMenu("keydown");
        } else if (event.key === "ArrowUp" && open) {
          close("escape-key");
        }
      } else {
        openMenu("keydown");
        change(step);
      }
    } else if (event.key === "Enter") {
      if (open) {
        selectHighlightedItem(highlightedIndex, event.shiftKey);
      } else {
        openMenu("keydown");
      }
    } else if (open && (event.key === "PageUp" || event.key === "PageDown")) {
      // APG listbox: jump a page of options; a closed menu keeps the default.
      event.preventDefault();
      changePage(event.key === "PageDown" ? 1 : -1);
    } else if (event.key === "Escape") {
      // Escape that cancels an IME composition is not a close.
      if (!isImeComposition(event)) close("escape-key");
    } else if (event.key === "Home" || event.key === "End") {
      // APG select-only combobox: Home/End open a closed listbox, then
      // move the highlight to the first/last option. The filterable
      // variant deliberately leaves these keys to the text caret.
      event.preventDefault();
      openMenu("keydown");
      highlightedIndex = event.key === "Home" ? 0 : itemsToUse.length - 1;
      highlightOrigin = "keyboard";
    } else if (event.key === "Delete" || event.key === "Backspace") {
      // Clear the whole selection from the keyboard, menu open or
      // closed, matching the filterable variant. Read-only reviews the
      // menu but never changes the selection.
      if (readonly) return;
      event.preventDefault();
      clearByUser("keydown");
    } else if (
      open &&
      (event.key === "a" || event.key === "A") &&
      (event.ctrlKey || event.metaKey)
    ) {
      // Only wired for the non-filterable field: the filterable text
      // input's Ctrl+A must keep selecting the filter text, not the
      // options, so it is deliberately left unhandled there.
      event.preventDefault();
      selectAllViaKeyboard();
    } else if (open && isTypeaheadKey(event)) {
      event.preventDefault();
      typeaheadSearch(event.key);
    }
  }
</script>

{#snippet text(/** @type {string | import("svelte").Snippet} */ source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

{#snippet groupHeader(
  /** @type {{ group: string; items: ReadonlyArray<Item & { checked: boolean }> }} */ row,
  /** @type {number} */ rowIndex,
)}
  <!-- Hidden from assistive tech: the enclosing group is named by a hidden
       label, which stays rendered when a virtualized window leaves this
       header out. -->
  <div
    role="presentation"
    aria-hidden="true"
    data-virtual-index={menuState.isMeasured ? rowIndex : undefined}
    class={[
      "bx--list-box__menu-group-header",
      rowIndex === 0 && "bx--list-box__menu-group-header--first",
    ]}
    onmousedown={(event) => {
      // Keep focus on the field, as options do.
      event.preventDefault();
    }}
  >
    {#if group}{@render group({
        group: row.group,
        items: row.items,
      })}{:else}{row.group}{/if}
  </div>
{/snippet}

{#snippet option(
  /** @type {Item & { checked: boolean }} */ item,
  /** @type {number} */ index,
  /** @type {number} */ rowIndex,
  /** @type {boolean} */ virtualized,
)}
  {@const optionId = `${id}-${item.id}`}
  {@const itemDisabled =
    !!item.disabled ||
    (hasMaxSelectedItems && !!item.isSelectAll) ||
    (isAtSelectionCap && !item.checked)}
  {@const capDisabled =
    isAtSelectionCap && !item.checked && !item.disabled && !item.isSelectAll}
  {@const optionInput = itemToInput(item) ?? {}}
  {@const optionChecked = item.isSelectAll ? allSelected : item.checked}
  {@const optionIndeterminate = !!item.isSelectAll && selectAllIndeterminate}
  <ListBoxMenuItem
    id={optionId}
    role="option"
    aria-labelledby="checkbox-{id}-{item.id}"
    aria-describedby={capDisabled ? maxSelectedId : undefined}
    aria-selected={optionChecked}
    aria-checked={item.isSelectAll
      ? selectAllIndeterminate
        ? "mixed"
        : allSelected
      : item.checked}
    aria-setsize={virtualized ? itemsToUse.length : undefined}
    aria-posinset={virtualized ? index + 1 : undefined}
    data-virtual-index={menuState.isMeasured ? rowIndex : undefined}
    active={item.isSelectAll ? false : item.checked}
    disabled={itemDisabled}
    onclick={(/** @type {MouseEvent} */ event) =>
      handleOptionClick(event, item, index, itemDisabled)}
    onmousedown={(/** @type {MouseEvent} */ event) => {
      // Keep focus on the field so screen readers don't
      // re-announce it on every option click.
      event.preventDefault();
    }}
  >
    <HighlightSlot {optionId}>
      {#snippet children({ highlighted })}
        <div
          class={[
            "bx--form-item bx--checkbox-wrapper",
            readonly && "bx--checkbox-wrapper--readonly",
          ]}
        >
          <input
            type="checkbox"
            class="bx--checkbox"
            id="checkbox-{id}-{item.id}"
            value={optionInput.value === "" || optionInput.value == null
              ? "on"
              : optionInput.value}
            tabindex="-1"
            style="display: none;"
            checked={optionChecked}
            indeterminate={optionIndeterminate}
            disabled={itemDisabled}
            aria-readonly={readonly || undefined}
          />
          <label
            for="checkbox-{id}-{item.id}"
            use:optionOverflowTitle={"title" in optionInput
              ? optionInput.title
              : useTitleInItem
                ? String(itemToString(item))
                : undefined}
            data-contained-checkbox-state={optionIndeterminate
              ? "mixed"
              : undefined}
            data-contained-checkbox-disabled={optionIndeterminate &&
            itemDisabled
              ? "true"
              : undefined}
            class="bx--checkbox-label"
          >
            <span class="bx--checkbox-label-text">
              {#if optionSnippet}
                {@render optionSnippet({
                  item,
                  index,
                  selected: optionChecked,
                  highlighted,
                })}
              {:else}
                {optionInput.labelText ?? itemToString(item)}
              {/if}
            </span>
          </label>
        </div>
      {/snippet}
    </HighlightSlot>
  </ListBoxMenuItem>
{/snippet}

<div
  use:fieldsetDisabled={(value) => (inDisabledFieldset = value)}
  bind:this={multiSelectRef}
  use:formReset={handleOptionFormReset}
  {@attach dismiss(() => ({
    enabled: open,
    type: ["click", "focusin"],
    handler: handleOutsideInteraction,
  }))}
  class={[
    "bx--multi-select__wrapper bx--list-box__wrapper",
    inline && "bx--multi-select__wrapper--inline bx--list-box__wrapper--inline",
    inline && showInvalid && "bx--multi-select__wrapper--inline--invalid",
    isFluid && "bx--list-box__wrapper--fluid",
    fluidNeutral && "bx--list-box__wrapper--fluid--neutral",
    fluidHoverable && "bx--list-box__wrapper--fluid--hoverable",
    isFluid && showInvalid && "bx--list-box__wrapper--fluid--invalid",
    isFluid && showWarn && "bx--list-box__wrapper--fluid--warning",
    isFluid && effectiveDisabled && "bx--list-box__wrapper--fluid--disabled",
    isFluid && readonly && "bx--list-box__wrapper--fluid--readonly",
    isFluid && condensed && "bx--list-box__wrapper--fluid--condensed",
    isFluid && filterable && "bx--multi-select--filterable__wrapper",
  ]}
>
  {#each formItems as item (item.id)}
    {@const itemInput = itemToInput(item) ?? {}}
    <input
      type="hidden"
      name={itemInput.name ?? name ?? item.id}
      value={itemInput.value ?? (name ? item.id : "")}
      disabled={effectiveDisabled}
      {form}
    />
  {/each}
  {#if labelText}
    <label
      for={id}
      class={[
        "bx--label",
        effectiveDisabled && "bx--label--disabled",
        hideLabel && "bx--visually-hidden",
        isFluid && typeof labelText === "function" && "bx--label--slotted",
      ]}
      use:titleWhenTruncated={{
        enabled: isFluid && typeof labelText !== "function",
      }}
    >
      {@render text(labelText)}
    </label>
  {/if}
  <ListBox
    id={comboId}
    disabled={effectiveDisabled}
    invalid={showInvalid}
    invalidText={isFluid ? "" : shownInvalidText}
    invalidId={errorId}
    {open}
    size={effectiveSize}
    warn={showWarn}
    warnText={isFluid ? "" : warnText}
    {warnId}
    class={[
      "bx--multi-select",
      decorator && !isFluid && "bx--list-box--decorator",
      $aiLabelState === "active" && "bx--list-box--ai-label",
      placement === "top" && "bx--list-box--up",
      filterable && "bx--combo-box bx--multi-select--filterable",
      // A clear button for the filter text shows by the chevron.
      filterable && value && "bx--list-box--clearable",
      showInvalid && "bx--multi-select--invalid",
      inline && "bx--multi-select--inline",
      readonly && "bx--multi-select--readonly",
      selectionCount > 0 && "bx--multi-select--selected",
      hasSelectAll && "bx--multi-select--selectall",
      // Thins the field's focus ring while an option holds the highlight.
      open && highlightedItemId != null && "bx--list-box--option-highlighted",
    ]}
  >
    {#if !filterable && showInvalid}
      <WarningFilled class="bx--list-box__invalid-icon" />
    {/if}
    {#if !filterable && showWarn}
      <WarningAltFilled
        class="bx--list-box__invalid-icon bx--list-box__invalid-icon--warning"
      />
    {/if}
    {#if decorator}
      <Decorator
        class="bx--field-decorator bx--list-box__inner-wrapper--decorator"
        size={effectiveSize}
        state={aiLabelState}
      >
        {@render decorator()}
      </Decorator>
    {/if}
    {#if filterable}
      <div
        style={isFluid ? undefined : "display: contents"}
        class={[
          isFluid && "bx--list-box__field--wrapper",
          showFluidFieldFocus && "bx--list-box__field--wrapper--input-focused",
        ]}
      >
        <div
          class={[
            "bx--list-box__field",
            !isFluid &&
              showFieldFocus &&
              "bx--list-box__field--wrapper--input-focused",
          ]}
        >
          {#if selectionCount > 0}
            <ListBoxSelection
              {selectionCount}
              onclear={({ trigger }) => clearByUser(trigger)}
              translateWithId={translateWithIdSelection}
              disabled={effectiveDisabled}
              {readonly}
              class={tagSize === "default" ? undefined : `bx--tag--${tagSize}`}
            />
          {/if}
          <input
            bind:this={inputRef}
            use:preserveFocusSelection={selectTextOnFocus && !effectiveDisabled}
            use:formReset={() => {
              // A form reset clears the filter field without an input event.
              if (inputRef) value = inputRef.value;
            }}
            bind:value
            aria-invalid={showInvalid ? "true" : undefined}
            aria-required={required ? "true" : undefined}
            aria-label={ariaLabel}
            {form}
            {...rest}
            role="combobox"
            tabindex="0"
            autocomplete="off"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={open ? "true" : "false"}
            aria-activedescendant={activeDescendantId}
            aria-disabled={effectiveDisabled ? "true" : undefined}
            aria-readonly={readonly ? "true" : undefined}
            aria-controls={open ? menuId : undefined}
            aria-describedby={joinDescribedBy(
              fieldDescribedById,
              ariaDescribedBy,
            )}
            class={[
              "bx--text-input",
              value === "" && "bx--text-input--empty",
              className,
            ]}
            onclick={(event) => {
              onclick?.(event);
              if (effectiveDisabled) return;
              openMenu("click");
            }}
            onkeydown={handleInputKeydown}
            oninput={(event) => {
              oninput?.(event);
              openMenu("input");
            }}
            onfocus={(event) => {
              onfocus?.(event);
              fieldFocused = true;
              if (selectTextOnFocus && !effectiveDisabled) {
                tick().then(() => inputRef?.select());
              }
            }}
            onblur={(event) => {
              onblur?.(event);
              fieldFocused = false;
            }}
            disabled={effectiveDisabled}
            {readonly}
            {placeholder}
            {id}
          />
          <!-- After the input, as in ComboBox, so the list box rules move the
            status icon left of the clear button once a query is typed. -->
          {#if showInvalid}
            <WarningFilled class="bx--list-box__invalid-icon" />
          {/if}
          {#if showWarn}
            <WarningAltFilled
              class="bx--list-box__invalid-icon bx--list-box__invalid-icon--warning"
            />
          {/if}
          {#if value}
            <ListBoxSelection
              onclear={() => {
                value = "";
                close("click");
                // `bind:value` writes the DOM value without firing "input",
                // so a consumer's `oninput` would miss this clear. Set the
                // node, then dispatch.
                if (inputRef) {
                  inputRef.value = "";
                  inputRef.dispatchEvent(new Event("input", { bubbles: true }));
                }
              }}
              translateWithId={translateWithIdSelection}
              disabled={effectiveDisabled}
              {readonly}
            />
          {/if}
          <ListBoxMenuIcon
            onclick={(event) => {
              if (effectiveDisabled) return;
              event.stopPropagation();
              if (open) close("click");
              else openMenu("click");
            }}
            {translateWithId}
            {open}
          />
        </div>
      </div>
    {:else}
      <!-- The visible focus outline renders on this wrapper, not the field
           itself: Carbon resets `.bx--list-box__field:focus` to a transparent
           outline, which outranks the `--input-focused` rule when both target
           the focused field. Placing `--input-focused` on the (unfocused)
           wrapper avoids that `:focus` specificity bump. -->
      <div
        class={[
          "bx--list-box__field--wrapper",
          (isFluid ? showFluidFieldFocus : showFieldFocus) &&
            "bx--list-box__field--wrapper--input-focused",
        ]}
      >
        <ListBoxField
          aria-invalid={showInvalid || undefined}
          aria-required={required || undefined}
          aria-label={ariaLabel}
          {form}
          {...rest}
          class={className}
          role="combobox"
          tabindex="0"
          aria-expanded={open ? "true" : "false"}
          aria-activedescendant={activeDescendantId}
          aria-controls={open ? menuId : undefined}
          aria-describedby={joinDescribedBy(
            fieldDescribedById,
            ariaDescribedBy,
          )}
          onfocus={(/** @type {FocusEvent} */ event) => {
            onfocus?.(event);
            fieldFocused = true;
          }}
          onclick={(/** @type {MouseEvent} */ event) => {
            onclick?.(event);
            if (effectiveDisabled) return;
            if (open) close("click");
            else openMenu("click");
          }}
          onkeydown={handleFieldKeydown}
          onblur={(/** @type {FocusEvent} */ event) => {
            onblur?.(event);
            fieldFocused = false;
          }}
          {id}
          disabled={effectiveDisabled}
          {readonly}
        >
          {#if selectionCount > 0}
            <ListBoxSelection
              {selectionCount}
              onclear={({ trigger }) => clearByUser(trigger)}
              translateWithId={translateWithIdSelection}
              disabled={effectiveDisabled}
              {readonly}
              class={tagSize === "default" ? undefined : `bx--tag--${tagSize}`}
            />
          {/if}
          <span class="bx--list-box__label" use:titleWhenTruncated>{label}</span
          >
          <ListBoxMenuIcon {open} {translateWithId} />
        </ListBoxField>
      </div>
    {/if}
    {#if required}
      <ListBoxRequiredInput
        hasValue={formItems.length > 0}
        disabled={effectiveDisabled}
        {readonly}
        focusTarget={filterable ? inputRef : fieldRef}
        {form}
        onrequiredinvalid={() => (requiredError = true)}
        onformreset={() => (requiredError = false)}
      />
    {/if}
    {#if open}
      <ListBoxMenu
        aria-label={ariaLabel ?? "Choose an item"}
        {id}
        portal={effectivePortalMenu}
        portalHostClass="bx--multi-select bx--list-box--expanded"
        {open}
        anchor={fieldRef}
        {direction}
        highlightedId={activeDescendantId}
        {wrapOptions}
        aria-multiselectable="true"
        aria-readonly={readonly || undefined}
        aria-busy={loading || undefined}
        onscroll={handleMenuScroll}
        bind:ref={listRef}
        style={menuState.isWindowed
          ? `max-height: ${menuState.menuMaxHeight}; overflow-y: auto;`
          : effectivePortalMenu
            ? `max-height: ${menuState.menuMaxHeight};`
            : undefined}
      >
        {#if menuState.isVirtualized}
          <VirtualWindow
            totalHeight={menuState.totalHeight}
            offsetY={menuState.offsetY}
            scrollTop={listScrollTop}
            pinned={menuState.isPinned}
            measured={menuState.isMeasured}
          >
            {#each menuRuns as run (run.key)}
              <ListBoxMenuGroup
                labelledBy={run.groupIndex > -1
                  ? `group-${id}-${run.groupIndex}`
                  : undefined}
              >
                {#each run.rows as item, runIndex (item.id)}
                  {@const rowIndex = run.start + runIndex}
                  {@const actualIndex = groupRows
                    ? groupRows.itemIndexByRow[rowIndex]
                    : rowIndex}
                  {#if actualIndex === -1}
                    {@render groupHeader(item, rowIndex)}
                  {:else}
                    {@render option(item, actualIndex, rowIndex, true)}
                  {/if}
                {/each}
              </ListBoxMenuGroup>
            {/each}
          </VirtualWindow>
        {:else}
          {#each menuRuns as run (run.key)}
            <ListBoxMenuGroup
              labelledBy={run.groupIndex > -1
                ? `group-${id}-${run.groupIndex}`
                : undefined}
            >
              {#each run.rows as item, runIndex (item.id)}
                {@const rowIndex = run.start + runIndex}
                {@const index = groupRows
                  ? groupRows.itemIndexByRow[rowIndex]
                  : rowIndex}
                {#if index === -1}
                  {@render groupHeader(item, rowIndex)}
                {:else}
                  {@render option(item, index, rowIndex, false)}
                {/if}
              {/each}
            </ListBoxMenuGroup>
          {/each}
        {/if}
        {#if showEmpty}
          <ListBoxMenuStatus>
            {#if empty}{@render empty({ value })}{:else}{emptyMessage}{/if}
          </ListBoxMenuStatus>
        {/if}
        {#if showLoading}
          <ListBoxMenuStatus>
            <InlineLoading description={loadingText} />
          </ListBoxMenuStatus>
        {/if}
      </ListBoxMenu>
    {/if}
  </ListBox>
  {#if isFluid}
    <hr class="bx--list-box__divider" />
  {/if}
  {#if isFluid && showInvalid && shownInvalidText}
    <div id={errorId} class="bx--form-requirement" role="alert">
      {shownInvalidText}
    </div>
  {/if}
  {#if isFluid && showWarn && warnText}
    <div id={warnId} class="bx--form-requirement">{warnText}</div>
  {/if}
  {#if selectedTagItems.length > 0}
    <div bind:this={selectedTagsRef} class="bx--multi-select__tags">
      <TagSet
        id="{id}-tags"
        navigation="roving"
        multiline={tagOverflow === "wrap"}
        overflowMode="popover"
        size={tagSize}
        ontagdismiss={handleTagClose}
      >
        {#each selectedTagItems as item, index (item.id)}
          {@const props = {
            filter: !readonly,
            disabled: effectiveDisabled || !!item.disabled,
            value: item.id,
            title: removeTagText,
            maxWidth: "13rem",
          }}
          <!-- Spreading `props` onto any tag keeps it wired to the set: its
               close button deselects the item by `value`. -->
          {#if tag}
            {@render tag({ item, index, props })}
          {:else}
            <Tag {...props}>{itemToString(item)}</Tag>
          {/if}
        {/each}
      </TagSet>
    </div>
  {/if}
  {#if !isFluid && !showInvalid && !showWarn && helperText}
    <div
      id={helperId}
      class={[
        "bx--form__helper-text",
        effectiveDisabled && "bx--form__helper-text--disabled",
      ]}
    >
      {helperText}
    </div>
  {/if}
  {#if groupRows}
    {#each groupRows.headers as header, groupIndex (header.id)}
      <span id="group-{id}-{groupIndex}" hidden>{header.group}</span>
    {/each}
  {/if}
  {#if hasMaxSelectedItems}
    <span id={maxSelectedId} class="bx--visually-hidden">{maxSelectedText}</span
    >
  {/if}
  {#if readonly}
    <span id={readonlyId} class="bx--visually-hidden"
      >{readonlyDescription}</span
    >
  {/if}
  {#if hasSelectionDescription}
    <span id={selectionId} class="bx--visually-hidden"
      >{selectionCountText(selectionCount)}. {clearSelectionText}</span
    >
  {/if}
  <!-- Live region for selection announcements. Always rendered (even while
       empty) so assistive tech registers the region before its text changes. -->
  <span role="status" aria-live="polite" class="bx--visually-hidden"
    >{statusText}</span
  >
</div>
