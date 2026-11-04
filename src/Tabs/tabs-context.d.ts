/** A `Tab` as `Tabs` and `TabsVertical` register it. */
export type TabEntry = {
  id: string;
  label: string;
  disabled: boolean;
  hasSecondaryLabel: boolean;
};

/**
 * What `Tabs` and `TabsVertical` give their `Tab`s and `TabContent`s.
 * Fields are getters over the parent's state.
 */
export type TabsContext = {
  /** The selected tab; `null` while it hasn't registered. */
  readonly selectedTabId: string | null;
  readonly iconOnly: boolean;
  readonly autoWidth: boolean;
  readonly fullWidth: boolean;
  readonly dismissible: boolean;
  readonly container: boolean;
  readonly navigation: boolean;
  /** Whether tabs draw a secondary label. */
  readonly secondaryLabelSupported: boolean;
  /** Whether any tab draws a secondary label. */
  readonly hasSecondaryLabel: boolean;
  dismissText: (label: string) => string;
  /** The panel a tab controls. */
  panelIdFor: (tabId: string) => string | undefined;
  /** The tab that labels a panel. */
  tabIdFor: (panelId: string) => string | undefined;
  isPanelSelected: (panelId: string) => boolean;
  add: (entry: TabEntry) => void;
  patch: (id: string, patch: Partial<Omit<TabEntry, "id">>) => void;
  remove: (id: string) => void;
  /** Registers a panel and returns its id: its own `id`, or the one its tab expects. */
  addPanel: (id: string | undefined, fallbackId: string) => string;
  renamePanel: (oldId: string, newId: string) => void;
  removePanel: (id: string) => void;
  /** Selects a tab as the user; calls `onselectedchange`. */
  select: (id: string) => void;
  /** Calls `ondismiss` for a tab. */
  dismiss: (id: string) => void;
};

export const getTabs: () => TabsContext;
export const setTabs: (context: TabsContext) => TabsContext;
export const hasTabs: () => boolean;
