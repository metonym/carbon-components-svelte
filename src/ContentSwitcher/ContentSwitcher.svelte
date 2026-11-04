<script>
  /**
   * @restProps {div}
   */
  let {
    /**
     * Set the selected index of the switch item.
     * Ignored when `selectedId` is set.
     * An out-of-range value selects the nearest switch.
     */
    selectedIndex = $bindable(0),

    /**
     * Specify the selected switch by id.
     * When set, takes precedence over `selectedIndex` and stays on the same
     * logical switch as switches are added or removed. Pair with a stable `id`
     * on each `Switch`.
     * @type {string | undefined}
     */
    selectedId = $bindable(undefined),

    /**
     * Specify the size of the content switcher.
     * Also accepts Carbon v11's `"md"` (the 40px default) and `"lg"` (`"xl"`).
     * @type {"sm" | "md" | "lg" | "xl" | undefined}
     */
    size = undefined,

    /**
     * Choose whether or not to automatically change selection
     * on focus when using arrow keys. Defaults to "automatic".
     * @type {"automatic" | "manual"}
     */
    selectionMode = "automatic",

    /** Set to `true` to use the low contrast variant */
    lowContrast = false,

    /**
     * Set to `true` to size each switch to its label instead of splitting the
     * width evenly. The switcher shrinks to fit its switches.
     */
    autoWidth = false,

    /**
     * Set to `true` when every switch sets `icon`, so the switcher fits its
     * switches from the first render, server-rendered markup included. The
     * switcher infers icon-only once its switches register, and that wins.
     */
    iconOnly = false,

    /**
     * Obtain a reference to the tablist HTML element.
     * @type {null | HTMLDivElement}
     */
    ref = $bindable(null),

    /**
     * Called when the user selects a switch, by click or with the arrow
     * keys in automatic mode. Not called when `selectedIndex` or
     * `selectedId` is set from outside.
     * @type {((detail: { index: number; id: string }) => void) | undefined}
     */
    onselectedchange = undefined,

    /**
     * The `Switch`es.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /**
     * The `SwitchPanel`s, rendered after the tablist.
     * @type {import("svelte").Snippet | undefined}
     */
    content = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import { onMount, tick, untrack } from "svelte";
  import { clampIndex } from "../utils/clamp-index.js";
  import { hasModifierKey } from "../utils/has-modifier-key.js";
  import {
    getLayoutDirection,
    resolveLayoutDirection,
  } from "../utils/layout-direction.js";
  import { observeDomOrder } from "../utils/observe-dom-order.js";
  import { resolveIdSelection } from "../utils/resolve-id-selection.js";
  import { rovingFocus } from "../utils/roving-focus.js";
  import { FIELD_SIZE_ALIASES, normalizeSize } from "../utils/size-aliases.js";
  import { syncDomOrder } from "../utils/sync-dom-order.js";
  import { provideTooltipGroup } from "../utils/tooltip-group.js";
  import { setContentSwitcher } from "./content-switcher-context.js";

  const effectiveSize = $derived(normalizeSize(size, FIELD_SIZE_ALIASES));
  const layoutDirection = getLayoutDirection();

  // Icon-only switches hand their tooltips off to each other, and to the
  // rest of an enclosing `TooltipGroup`.
  provideTooltipGroup();

  // Switches register while they initialize, in render order, so the server
  // and the first client render already know them. Each registration
  // replaces the array; Svelte batches the updates that follow.
  /** @type {Array<import("./content-switcher-context.js").SwitchEntry>} */
  let switches = $state.raw([]);
  /** `SwitchPanel`s in DOM order. A panel pairs with the switch at the same position. */
  /** @type {Array<{ id: string }>} */
  let panels = $state.raw([]);
  let focusedIndex = -1;
  // Set when registration may have left the arrays out of DOM order:
  // children mount out of order when they render conditionally.
  let needsDomSync = false;
  let needsPanelSync = false;

  /** @param {number} index */
  const clamp = (index) => clampIndex(index, 0, switches.length);

  // Switches read these through the context while they register. The
  // server memoizes a `$derived` on its first read, so the context computes
  // them fresh; the deriveds below memoize them for this component.

  // The selected switch: the one `selectedId` names, or the one at
  // `selectedIndex`. -1 while it hasn't registered: on the server and in the
  // first render, switches register one by one, so an index past the ones
  // registered so far isn't out of range yet. The effect below clamps once
  // every switch has registered.
  function findCurrentIndex() {
    if (selectedId !== undefined) {
      return switches.findIndex((s) => s.id === selectedId);
    }
    return selectedIndex >= 0 && selectedIndex < switches.length
      ? selectedIndex
      : -1;
  }

  // The selected switch holds the tab stop unless it is disabled; then the
  // first enabled switch does, so the switcher stays reachable by keyboard.
  // No tab stop while the selected switch is pending, so an earlier switch
  // doesn't take it on the server.
  function findTabStopId() {
    const current = switches[findCurrentIndex()];
    if (!current) return null;
    if (!current.disabled) return current.id;
    return switches.find((s) => !s.disabled)?.id ?? null;
  }

  function pairByPosition() {
    /** @type {Record<string, string>} */
    const panelBySwitch = {};
    /** @type {Record<string, string>} */
    const switchByPanel = {};
    const count = Math.min(switches.length, panels.length);
    for (let i = 0; i < count; i++) {
      panelBySwitch[switches[i].id] = panels[i].id;
      switchByPanel[panels[i].id] = switches[i].id;
    }
    return { panelBySwitch, switchByPanel };
  }

  const currentIndex = $derived(findCurrentIndex());
  const currentId = $derived(switches[currentIndex]?.id ?? null);
  const tabStopId = $derived(findTabStopId());

  // Inferred when every registered switch provides an `icon`. Until the
  // switches register, the `iconOnly` prop stands in.
  const isIconOnly = $derived(
    switches.length > 0 ? switches.every((s) => s.icon) : iconOnly,
  );

  // Keep the bound values on the selected switch: pull an out-of-range
  // `selectedIndex` back into the list, and re-anchor `selectedId` when its
  // switch is removed (the next switch, or the last).
  $effect.pre(() => {
    if (switches.length === 0) return;
    // Tracked, so a value set from outside is resolved too. The writes
    // below settle in one pass.
    selectedId;
    selectedIndex;
    untrack(() => {
      if (selectedId === undefined) {
        const index = clamp(selectedIndex);
        if (index !== selectedIndex) selectedIndex = index;
      } else {
        const resolved = resolveIdSelection({
          items: switches,
          selectedId,
          currentIndex: selectedIndex,
        });
        if (!resolved) return;
        if (selectedIndex !== resolved.index) selectedIndex = resolved.index;
        if (selectedId !== resolved.id) selectedId = resolved.id;
      }
    });
  });

  /**
   * @param {number} index
   * @param {boolean} user Calls `onselectedchange` when the selection moves.
   */
  function selectIndex(index, user) {
    const target = switches[index];
    if (!target) return;
    const changed = index !== currentIndex;
    if (selectedId !== undefined) selectedId = target.id;
    selectedIndex = index;
    if (user && changed) onselectedchange?.({ index, id: target.id });
  }

  setContentSwitcher({
    get currentId() {
      return switches[findCurrentIndex()]?.id ?? null;
    },
    get tabStopId() {
      return findTabStopId();
    },
    get pairs() {
      return pairByPosition();
    },
    add(entry) {
      if (switches.some((s) => s.id === entry.id)) return;
      // The last `selected` switch wins.
      if (entry.selected && selectedId === undefined) {
        selectedIndex = switches.length;
      }
      switches = [...switches, entry];
      needsDomSync = true;
    },
    remove(id) {
      // Keep the switch that is selected when an earlier one goes away.
      const keep = currentId;
      switches = switches.filter((s) => s.id !== id);
      if (selectedId === undefined && keep !== id) {
        const index = switches.findIndex((s) => s.id === keep);
        if (index > -1) selectedIndex = index;
      }
    },
    patch(id, patch) {
      const index = switches.findIndex((s) => s.id === id);
      if (index === -1) return;
      const current = switches[index];
      if (Object.entries(patch).every(([k, v]) => current[k] === v)) return;
      const next = [...switches];
      next[index] = { ...current, ...patch };
      switches = next;
    },
    select(id, user) {
      selectIndex(
        switches.findIndex((s) => s.id === id),
        user,
      );
    },
    addPanel(id) {
      if (panels.some((p) => p.id === id)) return;
      panels = [...panels, { id }];
      needsPanelSync = true;
    },
    removePanel(id) {
      panels = panels.filter((p) => p.id !== id);
    },
  });

  /**
   * @param {ReadonlyArray<{ id: string }>} a
   * @param {ReadonlyArray<{ id: string }>} b
   */
  function sameOrder(a, b) {
    return a.length === b.length && a.every((item, i) => item.id === b[i].id);
  }

  // Put switches and panels in DOM order once they render. The selected
  // switch stays selected by id.
  $effect(() => {
    switches;
    panels;
    untrack(() => {
      if (needsDomSync && ref) {
        needsDomSync = false;
        const keep = currentId;
        const next = syncDomOrder({
          root: ref,
          selector: "[role='tab']",
          items: switches,
        }).map(({ index, ...entry }) => entry);
        if (!sameOrder(next, switches)) {
          switches = next;
          const index = next.findIndex((s) => s.id === keep);
          if (index > -1 && selectedId === undefined) selectedIndex = index;
        }
      }
      // Panels render after the tablist, so order them within its parent.
      // Tabpanels that are not registered here (e.g., from a nested Tabs) are
      // dropped by id.
      if (needsPanelSync && panels.length > 0 && ref?.parentElement) {
        needsPanelSync = false;
        const next = syncDomOrder({
          root: ref.parentElement,
          selector: "[role='tabpanel']",
          items: panels,
        }).map(({ id }) => ({ id }));
        if (!sameOrder(next, panels)) panels = next;
      }
    });
  });

  onMount(() =>
    // A keyed reorder moves switches without re-registering them.
    observeDomOrder(ref, {
      selector: "[role='tab']",
      getItems: () => switches,
      onReorder: () => {
        needsDomSync = needsPanelSync = true;
        switches = [...switches];
      },
    }),
  );

  /** @param {number} index */
  async function focusSwitchElement(index) {
    await tick();
    const tab = document.getElementById(switches[index].id);
    if (tab instanceof HTMLElement) tab.focus();
  }

  /** @param {number} index */
  async function changeTo(index) {
    if (index < 0 || index >= switches.length) return;
    selectIndex(index, true);
    focusedIndex = -1;
    await focusSwitchElement(index);
  }

  /**
   * Move focus to a switch at an absolute index without changing selection.
   * @param {number} index
   */
  async function focusTo(index) {
    if (index < 0 || index >= switches.length) return;
    focusedIndex = index;
    await focusSwitchElement(index);
  }
</script>

<div
  bind:this={ref}
  role="tablist"
  use:rovingFocus={{
    selector: "[role='tab']",
    rtl: () => resolveLayoutDirection($layoutDirection, ref) === "rtl",
    skipDisabled: true,
    getItems: () =>
      switches
        .map((s) => document.getElementById(s.id))
        .filter((node) => node instanceof HTMLElement),
    getActiveIndex: () => {
      // Move from the switch that holds focus. Fall back to the manual-mode
      // focus index, then the selection, when focus is elsewhere.
      const active = switches.findIndex(
        (s) => s.id === document.activeElement?.id,
      );
      if (active >= 0) return active;
      if (focusedIndex >= 0) return focusedIndex;
      // Start from the fallback tab stop when the selected switch is disabled,
      // so the first arrow press moves off it instead of re-selecting it.
      if (switches[currentIndex]?.disabled) {
        const index = switches.findIndex((s) => s.id === tabStopId);
        if (index > -1) return index;
      }
      return currentIndex;
    },
    onMove: (index, event) => {
      if (hasModifierKey(event)) return;
      // Prevent the arrow keys from also scrolling the page.
      event.preventDefault();
      if (selectionMode === "manual") {
        focusTo(index);
      } else {
        changeTo(index);
      }
    },
  }}
  {...rest}
  class={[
    "bx--content-switcher",
    effectiveSize === "sm" && "bx--content-switcher--sm",
    effectiveSize === "xl" && "bx--content-switcher--xl",
    isIconOnly && "bx--content-switcher--icon-only",
    lowContrast && "bx--content-switcher--low-contrast",
    autoWidth && "bx--content-switcher--auto-width",
    className,
  ]}
>
  {@render children?.()}
</div>
{@render content?.()}
