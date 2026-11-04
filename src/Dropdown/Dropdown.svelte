<script>
  /**
   * @template {DropdownItem<any>} [Item=DropdownItem<any>]
   * @restProps {button}
   */

  /**
   * @template [Id=any]
   * @typedef {object} DropdownItem
   * @property {Id} id
   * @property {string} text
   * @property {boolean} [disabled] - Whether the item is disabled
   * @property {any} [icon] - Icon component shown left of the item text
   * @property {string} [group] - Group label. Items sharing a label render together under a non-selectable header, ungrouped items first and groups in order of first appearance.
   */

  const fallbackId = $props.id();

  let {
    /**
     * Set the dropdown items.
     * @type {ReadonlyArray<Item>}
     */
    items = [],

    /**
     * Override the display of a dropdown item.
     * @type {(item: Item) => string}
     */
    itemToString = (item) => item.text ?? item.id,

    /**
     * Specify the selected item id.
     * @type {Item["id"] | undefined}
     */
    selectedId = $bindable(undefined),

    /**
     * Specify the type of dropdown.
     * @type {"default" | "inline"}
     */
    type = "default",

    /**
     * Specify the direction of the dropdown menu.
     * @type {"bottom" | "top"}
     */
    direction = /** @type {"bottom" | "top"} */ ("bottom"),

    /**
     * Specify which edge of the field the menu lines up with.
     * Only visible when the menu is wider than the field, as with `type="inline"`.
     * Set to `"end"` to open the menu toward the start side, e.g. for an inline
     * dropdown near the right edge of its container.
     * @type {"start" | "end"}
     */
    align = /** @type {"start" | "end"} */ ("start"),

    /**
     * Specify the size of the dropdown field.
     * Inherits the parent `Form` size when unset.
     * Also accepts Carbon v11's `"md"` (the 40px default, which overrides a
     * `Form` size). `"lg"` and `"xl"` are both 48px.
     * @type {"xs" | "sm" | "md" | "lg" | "xl" | undefined}
     */
    size = undefined,

    /** Set to `true` to open the dropdown. */
    open = $bindable(false),

    /** Set to `true` to disable the dropdown */
    disabled = false,

    /**
     * Specify the label text, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    labelText = "",

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

    /** Set to `true` to use the read-only variant */
    readonly = false,

    /**
     * Specify the assistive text announced to screen readers when read-only.
     * Exposed because VoiceOver does not announce `aria-readonly`.
     */
    readonlyText = "Read-only",

    /**
     * Set to `true` to show a clear button when an item is selected.
     * Clears `selectedId` and calls `onclear`.
     * Also enables clearing the selection with Delete/Backspace.
     */
    clearable = false,

    /**
     * Specify the assistive text advertising the keyboard shortcut that clears
     * the selection. Appended to the field's description whenever there is a
     * selection to clear. Only used when `clearable` is `true`.
     */
    clearSelectionText = "To clear the selection, press Delete or Backspace",

    /**
     * Specify the assistive text announced through the status live region when
     * the selection is cleared via the keyboard or the clear button. Only used
     * when `clearable` is `true`.
     */
    selectionClearedText = "Selection cleared",

    /**
     * Set to `true` to reopen the dropdown menu after clearing the selection.
     * This allows users to immediately see all available items after clearing.
     * Only used when `clearable` is `true`.
     */
    openOnClear = false,

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

    /**
     * Specify the text shown in the field when nothing is selected.
     * @type {string | undefined}
     */
    label = undefined,

    /** Set to `true` to visually hide the label text */
    hideLabel = false,

    /**
     * Override the chevron icon label based on the open state.
     * Defaults to "Open menu" when closed and "Close menu" when open.
     * @type {((id: import("../ListBox/ListBoxMenuIcon.svelte").ListBoxMenuIconTranslationId) => string) | undefined}
     */
    translateWithId = undefined,

    /**
     * Override the label of the clear button when a selection is present.
     * Defaults to "Clear selected item" since a dropdown can only have one selection.
     * @type {((id: "clearSelection") => string) | undefined}
     */
    translateWithIdSelection = undefined,

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
     * Specify the message shown in the open menu when `items` is empty, such as
     * before async options arrive. Screen readers hear it through the status
     * live region, also when the `empty` snippet replaces the visible text.
     * Set to `""` to show no message.
     */
    emptyText = "No options",

    /**
     * Set to `true` to show a loading row after the options while the menu is
     * open, such as while fetching more items in `onmenuscrollend`. Marks the
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
     * Set an id for the field button
     * @type {string}
     */
    id = fallbackId,

    /**
     * Specify a name attribute for native form submission.
     * Mounts a hidden input whose value mirrors `selectedId`
     * (empty string when nothing is selected, or when the
     * selected item is disabled). Omitted from submission
     * when the dropdown is disabled.
     * @type {string | undefined}
     */
    name = undefined,

    /**
     * Specify the id of a form element outside the component to associate the
     * hidden `name` input with.
     * @type {string | undefined}
     */
    form = undefined,

    /**
     * Set to `true` to require a selection. A wrapping `<form>` blocks
     * submission while nothing is selected or the selected item is disabled,
     * and the field shows its invalid state with `requiredInvalidText`
     * instead of the browser's error bubble.
     */
    required = false,

    /**
     * Specify the invalid state text shown when a required dropdown blocks
     * submission. Cleared once an item is selected. `invalid` and
     * `invalidText` take precedence.
     */
    requiredInvalidText = "Select an item",

    /**
     * Obtain a reference to the button HTML element.
     * @type {null | HTMLButtonElement}
     */
    ref = $bindable(null),

    /**
     * Obtain a reference to the list HTML element.
     * @type {null | HTMLDivElement}
     */
    listRef = $bindable(null),

    /**
     * Called when the user opens or closes the menu. Opening reports
     * `"click"` or `"keydown"`; closing reports `"click"` (the field or the
     * chevron), `"keydown"` (Enter or Space without a new pick),
     * `"escape-key"` (Escape, Tab or Alt+ArrowUp), `"outside-click"` or
     * `"select"`. Not called when `open` is set from outside.
     * @type {((detail: { open: boolean; trigger: "click" | "keydown" | "escape-key" | "outside-click" | "select" }) => void) | undefined}
     */
    onopenchange = undefined,

    /**
     * Called when the user selects an item. Not called when `selectedId` is
     * set from outside.
     * @type {((detail: { selectedId: Item["id"]; selectedItem: Item }) => void) | undefined}
     */
    onselectedchange = undefined,

    /**
     * Called when the user clears the selection: with the clear button, or
     * with Delete or Backspace when `clearable` is set.
     * @type {((detail: { trigger: "click" | "keydown" }) => void) | undefined}
     */
    onclear = undefined,

    /**
     * Called when the menu is scrolled near the bottom, a signal to load more
     * items. Not the browser's native `scrollend` (scroll stopped).
     * @type {((detail: { scrollTop: number; scrollHeight: number; clientHeight: number }) => void) | undefined}
     */
    onmenuscrollend = undefined,

    /**
     * Custom content for each item, replacing its text.
     * @type {import("svelte").Snippet<[{ item: Item; index: number; selected: boolean; highlighted: boolean }]> | undefined}
     */
    children: itemSnippet = undefined,

    /**
     * Content at the start of each item, in place of the item's `icon`.
     * @type {import("svelte").Snippet<[{ item: Item; index: number; selected: boolean; highlighted: boolean }]> | undefined}
     */
    icon: iconSnippet = undefined,

    /**
     * Content at the end of each item. Replaces the checkmark on the selected item.
     * @type {import("svelte").Snippet<[{ item: Item; index: number; selected: boolean; highlighted: boolean }]> | undefined}
     */
    iconEnd = undefined,

    /**
     * Custom group header content.
     * @type {import("svelte").Snippet<[{ group: string; items: ReadonlyArray<Item> }]> | undefined}
     */
    group: groupSnippet = undefined,

    /**
     * Custom content of the open menu when `items` is empty.
     * @type {import("svelte").Snippet | undefined}
     */
    empty = undefined,

    /**
     * An `AILabel` for the field.
     * @type {import("svelte").Snippet | undefined}
     */
    decorator = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-label": ariaLabel = undefined,

    /** @type {string | undefined | null} */
    "aria-describedby": ariaDescribedBy = undefined,

    /** @type {import("svelte/elements").FocusEventHandler<HTMLButtonElement> | undefined | null} */
    onfocus = undefined,

    /** @type {import("svelte/elements").FocusEventHandler<HTMLButtonElement> | undefined | null} */
    onblur = undefined,

    /** @type {import("svelte/elements").KeyboardEventHandler<HTMLButtonElement> | undefined | null} */
    onkeydown = undefined,

    /** @type {import("svelte/elements").KeyboardEventHandler<HTMLButtonElement> | undefined | null} */
    onkeyup = undefined,

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
    orderByGroup,
    splitGroupRuns,
  } from "../ListBox/menu-groups.js";
  import {
    applyPostClearOptions,
    createStatusAnnouncer,
  } from "../ListBox/menu-status.js";
  import {
    createMenuWindow,
    scheduleHighlightScroll,
  } from "../ListBox/menu-window.js";
  import VirtualWindow from "../VirtualList/VirtualWindow.svelte";
  import {
    FORM_CONTEXT_KEY,
    FORM_SIZE_CONTEXT_KEY,
    MODAL_CONTEXT_KEY,
  } from "../constants/context-keys.js";
  import Checkmark from "../icons/Checkmark.svelte";
  import WarningAltFilled from "../icons/WarningAltFilled.svelte";
  import WarningFilled from "../icons/WarningFilled.svelte";
  import { clampIndex } from "../utils/clamp-index.js";
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
  import { isImeComposition } from "../utils/ime-composition.js";
  import { isOutsideClick } from "../utils/is-outside-click.js";
  import { createScrollEndTracker } from "../utils/is-scroll-near-end.js";
  import { menuSide } from "../utils/menu-placement.js";
  import { moveIndex } from "../utils/move-index.js";
  import { titleWhenTruncated } from "../utils/title-when-truncated.js";
  import {
    createTypeaheadBuffer,
    isTypeaheadKey,
    typeaheadIndex,
  } from "../utils/typeahead.js";
  import { resetVirtualScrollOnClose } from "../utils/virtualize.js";

  // A disabled `<fieldset>` around the component disables it too.
  let inDisabledFieldset = $state(false);
  const effectiveDisabled = $derived(disabled || inDisabledFieldset);

  const scrollEndTracker = createScrollEndTracker();
  const insideModal = getContext(MODAL_CONTEXT_KEY);
  const formContext = getContext(FORM_CONTEXT_KEY);
  /** @type {undefined | import("svelte/store").Readable<undefined | "xs" | "sm" | "md" | "xl">} */
  const formSize = getContext(FORM_SIZE_CONTEXT_KEY);
  const effectiveSize = $derived(size ?? $formSize);

  /**
   * Starts active when there is a decorator, so the server renders the AI
   * surface. `Decorator` clears it when no `AILabel` claims it.
   * @type {import("svelte/store").Writable<undefined | "active" | "revert">}
   */
  const aiLabelState = writable(
    untrack(() => decorator) ? "active" : undefined,
  );

  // Set for one open when the in-place menu turns out to be cut off by a
  // box around it (a scrolling panel, an `overflow: hidden` card): the menu
  // moves to a portal instead. Only when `portalMenu` is left unset.
  let portalWhenClipped = $state(false);
  $effect.pre(() => {
    if (!open) untrack(() => (portalWhenClipped = false));
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
      direction;
      tick().then(placeMenu);
    } else {
      untrack(() => (measuredSide = null));
    }
  });

  async function placeMenu() {
    if (!(open && listRef && ref)) return;
    const mayPortal = portalMenu === undefined;
    if (mayPortal && clippedBy(listRef)) {
      portalWhenClipped = true;
      return;
    }
    const side = menuSide(ref, listRef, direction);
    if (side === placement) return;
    measuredSide = side;
    await tick();
    if (mayPortal && open && listRef && clippedBy(listRef)) {
      portalWhenClipped = true;
    }
  }

  const menuAriaLabel = $derived(
    ariaLabel ??
      (typeof labelText === "string" && labelText
        ? labelText
        : "Choose an item"),
  );

  let highlightedIndex = $state(-1);
  /** @type {"keyboard" | null} */
  let highlightOrigin = $state(null);
  let prevHighlightedIndex = -1;
  let prevItemsLength = untrack(() => items.length);
  let listScrollTop = $state(0);
  let prevOpen = false;
  let fieldFocused = $state(false);
  /** Set when a required, empty dropdown blocked form submission. */
  let requiredError = $state(false);
  /** Text content of the visually-hidden status live region. */
  let statusText = $state("");
  /** Bumped when the menu window re-measures, so its state resolves again. */
  let measureVersion = $state(0);

  const menuWindow = createMenuWindow({
    getContainer: () => listRef,
    onScrollTop: (scrollTop) => {
      listScrollTop = scrollTop;
    },
    onState: () => {
      measureVersion += 1;
    },
  });

  const typeahead = createTypeaheadBuffer();
  const buildGroupRows = createGroupRows();

  /** @param {"click" | "keydown"} trigger */
  function openMenu(trigger) {
    if (open) return;
    open = true;
    onopenchange?.({ open: true, trigger });
  }

  /**
   * Close the menu and report the dismissal cause. Only reports a change
   * from open to closed, so redundant closes don't double-fire.
   * @param {"click" | "keydown" | "escape-key" | "outside-click" | "select"} trigger
   */
  function close(trigger) {
    if (!open) return;
    open = false;
    onopenchange?.({ open: false, trigger });
  }

  // `loading` takes effect at once for `aria-busy` and the empty state. Only
  // the indicator waits for `loadingDelay`; with no delay it follows `loading`
  // exactly.
  let showLoading = $state(untrack(() => loading));
  const loadingIndicator = createLoadingIndicator((shown) => {
    showLoading = shown;
  });
  $effect.pre(() => {
    loadingIndicator(loading, loadingDelay);
  });

  onMount(() => () => {
    typeahead.clear();
    menuWindow.destroy();
    loadingIndicator.cancel();
  });

  const inline = $derived(type === "inline");
  // A Dropdown that turns disabled or read-only while open closes its menu,
  // like a native `<select>`, so no option stays clickable. Closing here is
  // not a dismissal, so `onopenchange` is not called.
  $effect.pre(() => {
    if ((effectiveDisabled || readonly) && open) untrack(() => (open = false));
  });
  const itemsById = $derived(new Map(items.map((item) => [item.id, item])));
  const menuId = $derived(`menu-${id}`);
  const { helperId, errorId, warnId, readonlyId } = $derived(buildFieldIds(id));
  const selectionId = $derived(`selection-${id}`);
  const selectedItem = $derived(itemsById.get(selectedId));
  // Mirrors native `<select><option value>`: a disabled selection is not a
  // successful control, so it serializes as empty like nothing being selected.
  // A disabled Dropdown disables the input itself, so the field is omitted
  // entirely, like a disabled `<select>`.
  const hiddenInputValue = $derived(
    selectedId === undefined || selectedItem?.disabled ? "" : selectedId,
  );
  $effect.pre(() => {
    if (!required || hiddenInputValue !== "") {
      untrack(() => (requiredError = false));
    }
  });
  const shownInvalidText = $derived(
    requiredError && !invalid ? requiredInvalidText : invalidText,
  );
  // Invalid/warn states are suppressed when the dropdown is disabled or read-only.
  const { showInvalid, showWarn } = $derived(
    resolveValidationVisibility({
      invalid: invalid || requiredError,
      warn,
      disabled: effectiveDisabled,
      readonly,
    }),
  );
  const isFluid = $derived(!inline && (fluid || !!formContext?.isFluid));
  const hasSelectionDescription = $derived(
    clearable && !readonly && selectedId !== undefined,
  );
  const fieldDescribedById = $derived(
    joinDescribedBy(
      readonly ? readonlyId : null,
      hasSelectionDescription ? selectionId : null,
      resolveStatusDescribedBy({
        showInvalid,
        showWarn,
        helperText,
        invalidText: shownInvalidText,
        warnText,
        isFluid,
        errorId: errorId ?? "",
        warnId: warnId ?? "",
        helperId,
      }),
      ariaDescribedBy,
    ),
  );
  const showFieldFocus = $derived(isFluid && (fieldFocused || open));
  // Neutral = default fluid state, i.e. none of the other wrapper modifiers apply.
  const fluidNeutral = $derived(
    isFluid && !showInvalid && !showWarn && !effectiveDisabled && !readonly,
  );
  // Hoverable = disabled/readonly do not suppress the invalid/warning hover
  // tint. showInvalid/showWarn already exclude both, so this only matters
  // for readability of the selector it replaces.
  const fluidHoverable = $derived(isFluid && !effectiveDisabled && !readonly);

  const shouldVirtualize = $derived(
    shouldVirtualizeMenu({ items, virtualize }),
  );

  const grouped = $derived(items.some((item) => !!item.group));
  // Each group is contiguous: ungrouped items first, then groups in order of
  // first appearance. Highlight indexes point into this order.
  const menuItems = $derived(
    grouped ? orderByGroup(items, (item) => item.group) : items,
  );
  // Group headers render as rows of their own, so the menu window indexes
  // rows, not items. `toRowIndex` maps between the two.
  const groupRows = $derived(
    grouped && open ? buildGroupRows(menuItems) : null,
  );
  const menuRows = $derived(groupRows ? groupRows.rows : menuItems);

  // Scope the option id with the instance `id` so multiple Dropdowns on a
  // page do not produce duplicate DOM ids. `aria-activedescendant` references
  // this same scoped value (see the `ListBoxMenuItem` ids below).
  const highlightedId = $derived(
    highlightedIndex > -1 && menuItems[highlightedIndex]
      ? `${id}-${menuItems[highlightedIndex].id}`
      : undefined,
  );

  $effect.pre(() => {
    if (open) return;
    untrack(() => {
      highlightedIndex = -1;
      highlightOrigin = null;
      prevHighlightedIndex = -1;
      typeahead.clear();
    });
  });

  // Clamp a stale highlight when `items` shrinks while the menu is open, so a
  // keyboard-driven Enter/Space cannot dereference an index past the end.
  $effect.pre(() => {
    const length = items.length;
    untrack(() => {
      if (length === prevItemsLength) return;
      prevItemsLength = length;
      if (highlightedIndex >= length) {
        highlightedIndex = -1;
        highlightOrigin = null;
        prevHighlightedIndex = -1;
      }
    });
  });

  // Fluid (non-condensed) menu items are 64px tall (see css/_fluid-list-box.scss).
  // Portaled menus render outside the fluid wrapper, so they keep default heights.
  const hasFluidMenuItems = $derived(
    isFluid && !condensed && !effectivePortalMenu,
  );

  const menuState = $derived.by(() => {
    measureVersion;
    return menuWindow.update({
      items: menuRows,
      getKey: (row) => row.id,
      shouldVirtualize,
      virtualize,
      // A header is not as tall as an option, so a grouped menu measures its
      // rows the way a menu of wrapped options does.
      wrapOptions: wrapOptions || grouped,
      size: effectiveSize,
      fluid: hasFluidMenuItems,
      scrollTop: listScrollTop,
    });
  });
  // Each group's rendered rows sit inside one `role="group"` element.
  const menuRuns = $derived(
    splitGroupRuns(
      menuState.itemsToRender,
      menuState.isVirtualized ? menuState.startIndex : 0,
      groupRows,
    ),
  );
  $effect.pre(() => {
    scrollEndTracker.noteItemCount(items.length);
  });
  // A row after the (absent) options, not an option, so arrow keys never
  // reach it. `loading` holds it back until the items arrive.
  const hasNoItems = $derived(open && !loading && items.length === 0);
  const showEmpty = $derived(hasNoItems && (!!empty || emptyText !== ""));

  const announceStatus = createStatusAnnouncer((text) => (statusText = text));

  // The empty row is hidden from assistive tech, since a listbox holds only
  // options and groups, so the live region carries its message instead.
  $effect(() => {
    if (hasNoItems && emptyText) untrack(() => announceStatus(emptyText));
  });

  // Keep a keyboard highlight in view in a virtualized menu.
  $effect(() => {
    const index = toRowIndex(highlightedIndex);
    const isOpen = open;
    const virtualized = shouldVirtualize;
    const list = listRef;
    untrack(() => {
      prevHighlightedIndex = scheduleHighlightScroll({
        open: isOpen,
        shouldVirtualize: virtualized,
        highlightedIndex: index,
        prevHighlightedIndex,
        listRef: list,
        menuWindow,
      });
    });
  });

  // When the menu opens, start the keyboard highlight on the selected item
  // and scroll it into view. When it closes, reset the scroll state.
  $effect(() => {
    const isOpen = open;
    untrack(() => {
      const wasJustOpened = isOpen && !prevOpen;
      prevOpen = isOpen;
      if (!isOpen) {
        if (shouldVirtualize) listScrollTop = resetVirtualScrollOnClose();
        scrollEndTracker.reset();
        menuWindow.reset();
        return;
      }
      if (!wasJustOpened || selectedId === undefined || !selectedItem) return;
      const selectedIndex = menuItems.findIndex(
        (item) => item.id === selectedId,
      );
      if (selectedIndex < 0) return;
      highlightedIndex = selectedIndex;
      highlightOrigin = "keyboard";
      prevHighlightedIndex = toRowIndex(selectedIndex);
      tick().then(() => scrollToSelected(selectedIndex));
    });
  });

  // Reconcile the menu window with the options it now renders.
  $effect(() => {
    menuState.itemsToRender;
    listRef;
    untrack(() => menuWindow.sync());
  });

  /**
   * Scroll the menu that just opened to the selected option.
   * @param {number} selectedIndex
   */
  function scrollToSelected(selectedIndex) {
    if (!listRef) return;
    if (shouldVirtualize) {
      const row = toRowIndex(selectedIndex);
      // Keep the group header in view above the first option of a group.
      menuWindow.scrollIntoView(
        groupRows?.itemIndexByRow[row - 1] === -1 ? row - 1 : row,
        "top",
      );
      return;
    }
    // The list may overflow its max-height even below the virtualization
    // threshold.
    const selectedOption = listRef.querySelector('[aria-selected="true"]');
    if (!selectedOption) return;
    // Keep the group header in view above the first option of a group.
    const header = selectedOption.previousElementSibling;
    const target = header?.classList.contains("bx--list-box__menu-group-header")
      ? header
      : selectedOption;
    // Adjust the menu's own scrollTop instead of scrollIntoView,
    // which would also scroll the document.
    listRef.scrollTop +=
      target.getBoundingClientRect().top - listRef.getBoundingClientRect().top;
  }

  /**
   * Row position of the option at `index` in `menuItems`. Group headers are
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
      itemCount: items.length,
    });
    if (detail) onmenuscrollend?.(detail);
  }

  /** @param {number} step */
  function change(step) {
    // Disabled options stay in the keyboard navigation sequence (APG:
    // "Focusability of disabled controls") so assistive-tech users can
    // discover them; selectHighlighted and the option click handlers refuse
    // the actual selection.
    highlightedIndex = moveIndex(highlightedIndex, step, menuItems.length);
    highlightOrigin = "keyboard";
  }

  /**
   * Move the highlight a page of options (PageUp/PageDown), stopping at the
   * ends instead of wrapping.
   * @param {1 | -1} step
   */
  function changePage(step) {
    highlightedIndex = clampIndex(
      highlightedIndex,
      step * MENU_PAGE_STEP,
      menuItems.length,
    );
    highlightOrigin = "keyboard";
  }

  /** @param {string} character */
  function typeaheadSearch(character) {
    if (menuItems.length === 0) return;

    const query = typeahead.push(character);

    highlightedIndex = typeaheadIndex({
      items: menuItems,
      query,
      itemToString,
      index: highlightedIndex,
    });
    highlightOrigin = "keyboard";
  }

  /**
   * Clear the dropdown selection programmatically.
   * By default, focuses the dropdown after clearing. Set `options.focus` to `false` to prevent focusing.
   * Set `options.open` to `true` to open the dropdown menu after clearing.
   * Doesn't call `onclear`, which is for the user's own clearing.
   * @type {(options?: { focus?: boolean; open?: boolean; }) => Promise<void>}
   * @example
   * ```svelte
   * <Dropdown bind:this={dropdown} items={items} />
   * <button onclick={() => dropdown.clear()}>Clear</button>
   * ```
   */
  export async function clear(options = {}) {
    if (readonly || selectedId === undefined) return;
    selectedId = undefined;
    open = false;
    announceStatus(selectionClearedText);
    await applyPostClearOptions(
      options,
      (v) => (open = v),
      () => ref,
    );
  }

  /** @param {"click" | "keydown"} trigger */
  function clearByUser(trigger) {
    onclear?.({ trigger });
    clear({ open: openOnClear });
  }

  /** @param {Item} item */
  function select(item) {
    selectedId = item.id;
    onselectedchange?.({ selectedId: item.id, selectedItem: item });
    close("select");
  }

  /** @param {Item} item */
  function selectItem(item) {
    if (item.id === selectedId) {
      // Re-picking the current item is not a selection, so it closes the
      // menu without `onselectedchange`.
      close("select");
      return;
    }
    select(item);
  }

  function selectHighlighted() {
    if (!open) {
      openMenu("keydown");
      return;
    }
    const highlighted =
      highlightOrigin === "keyboard" && highlightedIndex > -1
        ? menuItems[highlightedIndex]
        : undefined;
    // Enter/Space on a highlighted disabled option -> the menu stays open.
    if (highlighted?.disabled) return;
    if (highlighted && highlighted.id !== selectedId) {
      select(highlighted);
    } else {
      // Enter or Space without picking a new item only closes the menu.
      close("keydown");
    }
  }

  /** @param {MouseEvent} event */
  function handleOutsideClick(event) {
    // The menu counts as inside even when not portaled: a click on a group
    // header lands in it without closing the menu itself.
    if (open && isOutsideClick(event, [ref, listRef])) {
      close("outside-click");
    }
  }

  /** @param {KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }} event */
  function handleKeydown(event) {
    onkeydown?.(event);
    if (
      event.key === " " ||
      event.key === "Enter" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();
    }

    if (readonly) return;

    if (event.key === "Enter") {
      selectHighlighted();
    } else if (event.key === "Tab") {
      // Tab dismisses without selecting; report it as a keyboard
      // dismissal, like ComboBox does for a Tab that accepts nothing.
      close("escape-key");
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const step = event.key === "ArrowDown" ? 1 : -1;
      if (event.altKey) {
        // APG combobox pattern: Alt+ArrowDown opens a closed menu without
        // moving the highlight; Alt+ArrowUp closes an open one, without
        // selecting, so it shares the keyboard-dismissal trigger.
        if (event.key === "ArrowDown" && !open) {
          openMenu("keydown");
        } else if (event.key === "ArrowUp" && open) {
          close("escape-key");
        }
      } else if (open) {
        change(step);
      } else {
        openMenu("keydown");
        // Opening highlights any selected item once the open state flushes;
        // if nothing is highlighted by then, start at the first (ArrowDown)
        // or last (ArrowUp) enabled item.
        tick().then(() => {
          if (highlightedIndex === -1) change(step);
        });
      }
    } else if (event.key === "Home" || event.key === "End") {
      // APG select-only combobox: Home/End open a closed listbox, then
      // move the highlight to the first/last option, mirroring the
      // open-and-move convention already used for the plain arrow keys.
      event.preventDefault();
      const toFirst = event.key === "Home";
      const moveToEdge = () => {
        if (menuItems.length === 0) return;
        highlightedIndex = toFirst ? 0 : menuItems.length - 1;
        highlightOrigin = "keyboard";
      };
      if (open) {
        moveToEdge();
      } else {
        openMenu("keydown");
        // Opening highlights the selected item once the open state
        // flushes; move to the edge after that so Home/End win.
        tick().then(moveToEdge);
      }
    } else if (open && (event.key === "PageUp" || event.key === "PageDown")) {
      // APG listbox: jump a page of options; a closed menu keeps the default.
      event.preventDefault();
      changePage(event.key === "PageDown" ? 1 : -1);
    } else if (event.key === "Escape") {
      // Escape that cancels an IME composition is not a close.
      if (!isImeComposition(event)) close("escape-key");
    } else if (
      clearable &&
      selectedId !== undefined &&
      (event.key === "Delete" || event.key === "Backspace")
    ) {
      // Clear the selection from the keyboard, menu open or closed,
      // matching the clear button, `onclear` included. Only wired when
      // `clearable` is set, since that is what makes clearing possible.
      event.preventDefault();
      clearByUser("keydown");
    } else if (isTypeaheadKey(event)) {
      // APG select-only combobox: typing on the closed field opens the
      // listbox and highlights the first match.
      event.preventDefault();
      const character = event.key;
      if (open) {
        typeaheadSearch(character);
      } else {
        openMenu("keydown");
        // Opening highlights the selected item once the open state flushes;
        // search after that so the match starts past the selection, the
        // same way it does in an open menu.
        tick().then(() => typeaheadSearch(character));
      }
    }
  }

  /** @param {KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }} event */
  function handleKeyup(event) {
    onkeyup?.(event);
    if (event.key !== " ") return;
    event.preventDefault();
    if (readonly) return;
    selectHighlighted();
  }
</script>

{#snippet content(/** @type {string | import("svelte").Snippet} */ source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

<!-- One menu row: a group header, or an option. `index` is the option's
     position in `menuItems`, -1 for a header. -->
{#snippet menuRow(
  /** @type {any} */ item,
  /** @type {number} */ rowIndex,
  /** @type {number} */ index,
  /** @type {boolean} */ windowed,
)}
  {#if index === -1}
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
      {#if groupSnippet}
        {@render groupSnippet({ group: item.group, items: item.items })}
      {:else}
        {item.group}
      {/if}
    </div>
  {:else}
    {@const selected = selectedId === item.id}
    {@const optionId = `${id}-${item.id}`}
    <ListBoxMenuItem
      id={optionId}
      active={selected}
      disabled={item.disabled}
      hasLeftIcon={Boolean(iconSnippet || item.icon)}
      aria-setsize={windowed ? items.length : undefined}
      aria-posinset={windowed ? index + 1 : undefined}
      data-virtual-index={menuState.isMeasured ? rowIndex : undefined}
      onclick={(event) => {
        if (item.disabled) {
          event.stopPropagation();
          return;
        }
        selectItem(item);
      }}
      onmousedown={(event) => {
        // Keep focus on the field so screen readers don't re-announce it on
        // every option click.
        event.preventDefault();
      }}
    >
      {#if iconSnippet}
        <span
          class="bx--list-box__menu-item__icon bx--list-box__menu-item__icon--left"
        >
          <HighlightSlot {optionId}>
            {#snippet children({ highlighted })}
              {@render iconSnippet({ item, index, selected, highlighted })}
            {/snippet}
          </HighlightSlot>
        </span>
      {:else if item.icon}
        <span
          class="bx--list-box__menu-item__icon bx--list-box__menu-item__icon--left"
        >
          <item.icon />
        </span>
      {/if}
      {#if itemSnippet}
        <HighlightSlot {optionId}>
          {#snippet children({ highlighted })}
            {@render itemSnippet({ item, index, selected, highlighted })}
          {/snippet}
        </HighlightSlot>
      {:else}
        {itemToString(item)}
      {/if}
      {#if iconEnd}
        <span
          class="bx--list-box__menu-item__icon bx--list-box__menu-item__icon--right"
        >
          <HighlightSlot {optionId}>
            {#snippet children({ highlighted })}
              {@render iconEnd({ item, index, selected, highlighted })}
            {/snippet}
          </HighlightSlot>
        </span>
      {:else if selected}
        <Checkmark class="bx--list-box__menu-item__selected-icon" />
      {/if}
    </ListBoxMenuItem>
  {/if}
{/snippet}

{#snippet menuOptions(/** @type {boolean} */ windowed)}
  {#each menuRuns as run (run.key)}
    <ListBoxMenuGroup
      labelledBy={run.groupIndex > -1
        ? `group-${id}-${run.groupIndex}`
        : undefined}
    >
      {#each run.rows as item, runIndex (item.id)}
        {@const rowIndex = run.start + runIndex}
        {@render menuRow(
          item,
          rowIndex,
          groupRows ? groupRows.itemIndexByRow[rowIndex] : rowIndex,
          windowed,
        )}
      {/each}
    </ListBoxMenuGroup>
  {/each}
{/snippet}

<div
  use:fieldsetDisabled={(value) => (inDisabledFieldset = value)}
  class={[
    "bx--dropdown__wrapper bx--list-box__wrapper",
    inline && "bx--dropdown__wrapper--inline bx--list-box__wrapper--inline",
    inline && showInvalid && "bx--dropdown__wrapper--inline--invalid",
    isFluid && "bx--list-box__wrapper--fluid",
    fluidNeutral && "bx--list-box__wrapper--fluid--neutral",
    fluidHoverable && "bx--list-box__wrapper--fluid--hoverable",
    isFluid && showInvalid && "bx--list-box__wrapper--fluid--invalid",
    isFluid && showWarn && "bx--list-box__wrapper--fluid--warning",
    isFluid && effectiveDisabled && "bx--list-box__wrapper--fluid--disabled",
    isFluid && readonly && "bx--list-box__wrapper--fluid--readonly",
    isFluid && condensed && "bx--list-box__wrapper--fluid--condensed",
  ]}
  {@attach dismiss(() => ({
    enabled: open,
    type: "click",
    handler: handleOutsideClick,
  }))}
>
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
        enabled: isFluid && typeof labelText === "string",
      }}
    >
      {@render content(labelText)}
    </label>
  {/if}
  {#if name}
    <input
      type="hidden"
      {name}
      value={hiddenInputValue}
      disabled={effectiveDisabled}
      {form}
    />
  {/if}
  <ListBox
    {type}
    size={effectiveSize}
    class={[
      "bx--dropdown",
      decorator && !isFluid && "bx--list-box--decorator",
      $aiLabelState === "active" && "bx--list-box--ai-label",
      placement === "top" && "bx--list-box--up",
      showInvalid && "bx--dropdown--invalid",
      showWarn && "bx--dropdown--warning",
      clearable &&
        selectedId !== undefined &&
        "bx--dropdown--clearable bx--list-box--clearable",
      open && "bx--dropdown--open",
      effectiveSize === "xs" && "bx--dropdown--xs",
      effectiveSize === "sm" && "bx--dropdown--sm",
      effectiveSize === "lg" && "bx--dropdown--lg",
      effectiveSize === "xl" && "bx--dropdown--xl",
      inline && "bx--dropdown--inline",
      effectiveDisabled && "bx--dropdown--disabled",
      readonly && "bx--dropdown--readonly",
    ]}
    onclick={(event) => {
      if (effectiveDisabled || readonly) return;
      const target = /** @type {Node} */ (event.target);
      // Options close the menu themselves. Anything else in the menu, such
      // as a group header, is not a dismissal.
      if (listRef?.contains(target)) return;
      if (open) close("click");
      else if (ref?.contains(target)) openMenu("click");
    }}
    disabled={effectiveDisabled}
    {open}
    invalid={showInvalid}
    warn={showWarn}
  >
    {#if showInvalid}
      <WarningFilled class="bx--list-box__invalid-icon" />
    {/if}
    {#if showWarn}
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
    <div
      style={isFluid ? undefined : "display: contents"}
      class={[
        isFluid && "bx--list-box__field--wrapper",
        showFieldFocus && "bx--list-box__field--wrapper--input-focused",
      ]}
    >
      <button
        bind:this={ref}
        type="button"
        role="combobox"
        tabindex="0"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-readonly={readonly || undefined}
        aria-required={required || undefined}
        aria-haspopup="listbox"
        aria-activedescendant={highlightedId ?? ""}
        aria-controls={open ? menuId : undefined}
        aria-invalid={showInvalid || undefined}
        aria-describedby={fieldDescribedById}
        disabled={effectiveDisabled}
        {id}
        {...rest}
        class={[
          "bx--list-box__field",
          clearable &&
            selectedId !== undefined &&
            "bx--list-box__field--clearable",
          className,
        ]}
        onfocus={(event) => {
          if (isFluid) fieldFocused = true;
          onfocus?.(event);
        }}
        onblur={(event) => {
          if (isFluid) fieldFocused = false;
          onblur?.(event);
        }}
        onkeydown={handleKeydown}
        onkeyup={handleKeyup}
      >
        <span class="bx--list-box__label" use:titleWhenTruncated>
          {#if selectedItem}
            {itemToString(selectedItem)}
          {:else}
            {label ?? ""}
          {/if}
        </span>
        {#if clearable && selectedId !== undefined}
          <ListBoxSelection
            onclear={({ trigger }) => clearByUser(trigger)}
            translateWithId={translateWithIdSelection}
            disabled={effectiveDisabled}
            {readonly}
          />
        {/if}
        <ListBoxMenuIcon
          onclick={(event) => {
            event.stopPropagation();
            if (effectiveDisabled || readonly) return;
            if (open) close("click");
            else openMenu("click");
          }}
          {translateWithId}
          {open}
        />
      </button>
    </div>
    {#if required}
      <ListBoxRequiredInput
        hasValue={hiddenInputValue !== ""}
        disabled={effectiveDisabled}
        {readonly}
        focusTarget={ref}
        {form}
        onrequiredinvalid={() => (requiredError = true)}
        onformreset={() => (requiredError = false)}
      />
    {/if}
    {#if open}
      <ListBoxMenu
        aria-label={menuAriaLabel}
        {id}
        portal={effectivePortalMenu}
        portalHostClass={inline ? "bx--dropdown__menu-host--inline" : undefined}
        {open}
        anchor={ref}
        {direction}
        {align}
        {highlightedId}
        {wrapOptions}
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
            {@render menuOptions(true)}
          </VirtualWindow>
        {:else}
          {@render menuOptions(false)}
        {/if}
        {#if showEmpty}
          <ListBoxMenuStatus>
            {#if empty}{@render empty()}{:else}{emptyText}{/if}
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
  {#if showInvalid && shownInvalidText}
    <div id={errorId} class="bx--form-requirement" role="alert">
      {shownInvalidText}
    </div>
  {/if}
  {#if showWarn && warnText}
    <div id={warnId} class="bx--form-requirement">{warnText}</div>
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
  {#if readonly}
    <span id={readonlyId} class="bx--visually-hidden">{readonlyText}</span>
  {/if}
  {#if hasSelectionDescription}
    <span id={selectionId} class="bx--visually-hidden"
      >{clearSelectionText}</span
    >
  {/if}
  <!-- Live region for selection announcements. Always rendered (even while
       empty) so assistive tech registers the region before its text changes. -->
  <span role="status" aria-live="polite" class="bx--visually-hidden"
    >{statusText}</span
  >
</div>
