// @ts-check
import { createContext } from "svelte";

/**
 * @typedef {object} SwitchEntry
 * @property {string} id
 * @property {string} text
 * @property {boolean} selected
 * @property {boolean} icon
 * @property {boolean} disabled
 */

/**
 * What a `ContentSwitcher` gives its `Switch`es and `SwitchPanel`s. Fields
 * are getters over the switcher's state.
 * @typedef {object} ContentSwitcherContext
 * @property {string | null} currentId The selected switch.
 * @property {string | null} tabStopId The switch that holds the tab stop.
 * @property {{ panelBySwitch: Record<string, string>; switchByPanel: Record<string, string> }} pairs Switch-panel pairing by position.
 * @property {(entry: SwitchEntry) => void} add
 * @property {(id: string) => void} remove
 * @property {(id: string, patch: Partial<Pick<SwitchEntry, "disabled" | "icon">>) => void} patch
 * @property {(id: string, user: boolean) => void} select Selects a switch; `user` calls `onselectedchange`.
 * @property {(id: string) => void} addPanel
 * @property {(id: string) => void} removePanel
 */

/** @type {[() => ContentSwitcherContext, (context: ContentSwitcherContext) => ContentSwitcherContext, () => boolean]} */
export const [getContentSwitcher, setContentSwitcher, hasContentSwitcher] =
  createContext();
