import type { TabEntry, TabsContext } from "./tabs-context.js";

/** What `Tabs` or `TabsVertical` hands `TabsState`, as getters and setters over its props. */
export type TabsHost = {
  selectedIndex: number;
  selectedId: string | undefined;
  hasContent: boolean;
  iconOnly: boolean;
  autoWidth: boolean;
  fullWidth: boolean;
  dismissible: boolean;
  container: boolean;
  navigation: boolean;
  secondaryLabelSupported: boolean;
  dismissText: (label: string) => string;
  onselectedchange:
    ((detail: { index: number; id: string }) => void) | undefined;
  dismiss: (id: string) => void;
  getTabRoot: () => Element | null;
  getPanelRoot: () => { root: Element; selector: string } | null;
};

/**
 * The tab and panel registry and selection shared by `Tabs` and
 * `TabsVertical`. Construct it while the component initializes: it provides
 * the context and sets up its effects.
 */
export class TabsState {
  constructor(host: TabsHost);
  /** Tabs, in DOM order once they render. */
  tabs: ReadonlyArray<TabEntry>;
  /** Panels, in DOM order. A panel pairs with the tab at the same position. */
  panels: ReadonlyArray<{ id: string }>;
  /** The tab arrow keys moved to in manual activation; -1 when none. */
  focusedIndex: number;
  /** The context given to the tabs and panels. */
  context: TabsContext;
  /** The selected tab's position; -1 while it hasn't registered. */
  readonly currentIndex: number;
  readonly selectedTabId: string | null;
  readonly hasSecondaryLabel: boolean;
  findCurrentIndex(): number;
  /** Select the tab at `index` as the user, calling `onselectedchange` when the selection moves. */
  selectIndex(index: number): void;
}
