// @ts-check
import { createContext } from "svelte";

/**
 * @typedef {object} TabEntry
 * @property {string} id
 * @property {string} label
 * @property {boolean} disabled
 * @property {boolean} hasSecondaryLabel
 */

/**
 * What `Tabs` and `TabsVertical` give their `Tab`s and `TabContent`s.
 * Fields are getters over the parent's state.
 * @typedef {object} TabsContext
 * @property {string | null} selectedTabId The selected tab; `null` while it hasn't registered.
 * @property {boolean} iconOnly
 * @property {boolean} autoWidth
 * @property {boolean} fullWidth
 * @property {boolean} dismissible
 * @property {boolean} container
 * @property {boolean} navigation
 * @property {boolean} secondaryLabelSupported Whether tabs draw a secondary label.
 * @property {boolean} hasSecondaryLabel Whether any tab draws a secondary label.
 * @property {(label: string) => string} dismissText
 * @property {(tabId: string) => string | undefined} panelIdFor The panel a tab controls.
 * @property {(panelId: string) => string | undefined} tabIdFor The tab that labels a panel.
 * @property {(panelId: string) => boolean} isPanelSelected
 * @property {(entry: TabEntry) => void} add
 * @property {(id: string, patch: Partial<Omit<TabEntry, "id">>) => void} patch
 * @property {(id: string) => void} remove
 * @property {(id: string | undefined, fallbackId: string) => string} addPanel Registers a panel and returns its id: its own `id`, or the one its tab expects.
 * @property {(oldId: string, newId: string) => void} renamePanel
 * @property {(id: string) => void} removePanel
 * @property {(id: string) => void} select Selects a tab as the user; calls `onselectedchange`.
 * @property {(id: string) => void} dismiss Calls `ondismiss` for a tab.
 */

/** @type {[() => TabsContext, (context: TabsContext) => TabsContext, () => boolean]} */
export const [getTabs, setTabs, hasTabs] = createContext();
