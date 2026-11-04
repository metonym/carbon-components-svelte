// @ts-check
import { onMount, untrack } from "svelte";
import { clampIndex } from "../utils/clamp-index.js";
import { observeDomOrder } from "../utils/observe-dom-order.js";
import { resolveIdSelection } from "../utils/resolve-id-selection.js";
import { syncDomOrder } from "../utils/sync-dom-order.js";
import { setTabs } from "./tabs-context.js";

/**
 * What `Tabs` or `TabsVertical` hands its state, as getters (and setters
 * for the two bindable selection props) over its props.
 * @typedef {object} TabsHost
 * @property {number} selectedIndex
 * @property {string | undefined} selectedId
 * @property {boolean} hasContent Whether panels render in the `content` snippet.
 * @property {boolean} iconOnly
 * @property {boolean} autoWidth
 * @property {boolean} fullWidth
 * @property {boolean} dismissible
 * @property {boolean} container
 * @property {boolean} navigation
 * @property {boolean} secondaryLabelSupported
 * @property {(label: string) => string} dismissText
 * @property {((detail: { index: number; id: string }) => void) | undefined} onselectedchange
 * @property {(id: string) => void} dismiss
 * @property {() => Element | null} getTabRoot The element holding the tabs.
 * @property {() => { root: Element; selector: string } | null} getPanelRoot Where the panels render.
 */

/** @param {ReadonlyArray<{ id: string }>} a @param {ReadonlyArray<{ id: string }>} b */
const sameOrder = (a, b) =>
  a.length === b.length && a.every((item, i) => item.id === b[i].id);

/**
 * The tab and panel registry and selection shared by `Tabs` and
 * `TabsVertical`. Construct it while the component initializes: it provides
 * the context and sets up its effects.
 */
export class TabsState {
  /**
   * Tabs, in DOM order once they render. Each registers while it
   * initializes, so the server and the first client render know it.
   * @type {ReadonlyArray<import("./tabs-context.js").TabEntry>}
   */
  tabs = $state.raw([]);

  /**
   * Panels, in DOM order. A panel pairs with the tab at the same position.
   * @type {ReadonlyArray<{ id: string }>}
   */
  panels = $state.raw([]);

  /** The tab arrow keys moved to in manual activation; -1 when none. */
  focusedIndex = -1;

  // Set when registration may have left an array out of DOM order: a child
  // added after mount, such as one rendered by an `{#if}` that turned true,
  // registers last wherever it renders. The first render registers in
  // document order, so it needs no sync; sorting then would query the
  // panels' whole parent once per instance.
  #needsTabSync = false;
  #needsPanelSync = false;
  #mounted = false;

  /** @type {TabsHost} */
  #host;

  /**
   * The context given to the tabs and panels; `PageHeader` passes it on
   * to panels in its body.
   * @type {import("./tabs-context.js").TabsContext}
   */
  context;

  /** The selected tab's position; -1 while it hasn't registered. */
  currentIndex = $derived(this.findCurrentIndex());
  selectedTabId = $derived(this.tabs[this.currentIndex]?.id ?? null);
  hasSecondaryLabel = $derived(this.#anySecondaryLabel());

  /** @param {TabsHost} host */
  constructor(host) {
    this.#host = host;
    this.context = this.#provide();

    // Keep the bound values on a registered tab: pull an out-of-range
    // `selectedIndex` into the list, and re-anchor `selectedId` when its tab
    // goes away (the tab that took its place, or the last).
    $effect.pre(() => {
      const { tabs } = this;
      const { selectedId, selectedIndex } = host;
      if (tabs.length === 0) return;
      untrack(() => {
        this.focusedIndex = -1;
        if (selectedId === undefined) {
          const index = clampIndex(selectedIndex, 0, tabs.length);
          if (index !== selectedIndex) host.selectedIndex = index;
          return;
        }
        const resolved = resolveIdSelection({
          items: tabs,
          selectedId,
          currentIndex: selectedIndex,
        });
        if (!resolved) return;
        if (host.selectedIndex !== resolved.index) {
          host.selectedIndex = resolved.index;
        }
        if (host.selectedId !== resolved.id) host.selectedId = resolved.id;
      });
    });

    // Put tabs and panels in DOM order once they render. An insert or a
    // removal keeps the selected index, so the tab now at that position is
    // selected; `selectedId` keeps its tab through the effect above.
    // The roots are tracked: a panel root can bind after the tabs mount.
    $effect(() => {
      this.tabs;
      this.panels;
      const tabRoot = host.getTabRoot();
      const panelRoot = host.getPanelRoot();
      untrack(() => this.#syncOrder(tabRoot, panelRoot));
    });

    onMount(() => {
      this.#mounted = true;
      const root = host.getTabRoot();
      if (!root) return;
      // A keyed reorder moves tabs without re-registering them. Keep the
      // selected tab selected at its new position.
      return observeDomOrder(root, {
        selector: ".bx--tabs__nav-link",
        getItems: () => this.tabs,
        onReorder: () => {
          const keep = this.selectedTabId;
          this.#needsTabSync = this.#needsPanelSync = true;
          this.#syncOrder(host.getTabRoot(), host.getPanelRoot());
          const index = this.tabs.findIndex((tab) => tab.id === keep);
          if (index > -1 && host.selectedId === undefined) {
            host.selectedIndex = index;
          }
        },
      });
    });
  }

  // Tabs and panels read selection through the context while they register.
  // The server memoizes a `$derived` on its first read, so these compute
  // fresh; the fields above memoize them for the host.

  /**
   * The tab `selectedId` names, or the one at `selectedIndex`. -1 while it
   * hasn't registered: tabs register one by one, so an index past the ones
   * registered so far isn't out of range yet.
   */
  findCurrentIndex() {
    const { selectedId, selectedIndex } = this.#host;
    if (selectedId !== undefined) {
      return this.tabs.findIndex((tab) => tab.id === selectedId);
    }
    return selectedIndex >= 0 && selectedIndex < this.tabs.length
      ? selectedIndex
      : -1;
  }

  #anySecondaryLabel() {
    return (
      this.#host.secondaryLabelSupported &&
      this.tabs.some((tab) => tab.hasSecondaryLabel)
    );
  }

  /** @param {string} panelId */
  #panelIndex(panelId) {
    return this.panels.findIndex((panel) => panel.id === panelId);
  }

  /** @param {string} id */
  #tabIndex(id) {
    return this.tabs.findIndex((tab) => tab.id === id);
  }

  /**
   * Select the tab at `index` as the user, calling `onselectedchange` when
   * the selection moves.
   * @param {number} index
   */
  selectIndex(index) {
    const tab = this.tabs[index];
    if (!tab) return;
    this.focusedIndex = -1;
    const changed = index !== this.findCurrentIndex();
    if (this.#host.selectedId !== undefined) this.#host.selectedId = tab.id;
    this.#host.selectedIndex = index;
    if (changed) this.#host.onselectedchange?.({ index, id: tab.id });
  }

  /**
   * @param {Element | null} tabRoot
   * @param {{ root: Element; selector: string } | null} panelRoot
   */
  #syncOrder(tabRoot, panelRoot) {
    if (this.#needsTabSync && tabRoot) {
      this.#needsTabSync = false;
      const next = syncDomOrder({
        root: tabRoot,
        selector: ".bx--tabs__nav-link",
        items: this.tabs,
      }).map(({ index, ...entry }) => entry);
      if (!sameOrder(next, this.tabs)) this.tabs = next;
    }
    if (this.#needsPanelSync && panelRoot && this.panels.length > 0) {
      this.#needsPanelSync = false;
      // Panels that aren't registered here (a nested `Tabs`) drop out by id.
      const next = syncDomOrder({
        root: panelRoot.root,
        selector: panelRoot.selector,
        items: this.panels,
      }).map(({ id }) => ({ id }));
      if (!sameOrder(next, this.panels)) this.panels = next;
    }
  }

  #provide() {
    const state = this;
    const host = this.#host;
    return setTabs({
      get selectedTabId() {
        return state.tabs[state.findCurrentIndex()]?.id ?? null;
      },
      get iconOnly() {
        return host.iconOnly;
      },
      get autoWidth() {
        return host.autoWidth;
      },
      get fullWidth() {
        return host.fullWidth;
      },
      get dismissible() {
        return host.dismissible;
      },
      get container() {
        return host.container;
      },
      get navigation() {
        return host.navigation;
      },
      get secondaryLabelSupported() {
        return host.secondaryLabelSupported;
      },
      get hasSecondaryLabel() {
        return state.#anySecondaryLabel();
      },
      dismissText: (label) => host.dismissText(label),
      panelIdFor(tabId) {
        const index = state.#tabIndex(tabId);
        if (index === -1) return undefined;
        const panel = state.panels[index];
        if (panel) return panel.id;
        // The panel renders after the tabs; until it registers, name the id
        // it will take when it has none of its own.
        return host.hasContent ? `${tabId}-panel` : undefined;
      },
      tabIdFor(panelId) {
        const index = state.#panelIndex(panelId);
        return index === -1 ? undefined : state.tabs[index]?.id;
      },
      isPanelSelected(panelId) {
        const index = state.#panelIndex(panelId);
        return index > -1 && index === state.findCurrentIndex();
      },
      add(entry) {
        if (state.#tabIndex(entry.id) > -1) return;
        state.tabs = [...state.tabs, entry];
        if (state.#mounted) state.#needsTabSync = true;
      },
      patch(id, patch) {
        const index = state.#tabIndex(id);
        if (index === -1) return;
        const current = state.tabs[index];
        if (
          Object.entries(patch).every(
            ([key, value]) =>
              current[/** @type {keyof typeof current} */ (key)] === value,
          )
        ) {
          return;
        }
        const next = [...state.tabs];
        next[index] = { ...current, ...patch };
        state.tabs = next;
      },
      remove(id) {
        state.tabs = state.tabs.filter((tab) => tab.id !== id);
      },
      addPanel(ownId, fallbackId) {
        // Without its own `id`, a panel takes the one its tab already points
        // `aria-controls` at.
        const tab = state.tabs[state.panels.length];
        const id =
          ownId ?? (host.hasContent && tab ? `${tab.id}-panel` : fallbackId);
        if (state.#panelIndex(id) === -1) {
          state.panels = [...state.panels, { id }];
          if (state.#mounted) state.#needsPanelSync = true;
        }
        return id;
      },
      renamePanel(oldId, newId) {
        state.panels = state.panels.map((panel) =>
          panel.id === oldId ? { id: newId } : panel,
        );
      },
      removePanel(id) {
        state.panels = state.panels.filter((panel) => panel.id !== id);
      },
      select(id) {
        state.selectIndex(state.#tabIndex(id));
      },
      dismiss: (id) => host.dismiss(id),
    });
  }
}
