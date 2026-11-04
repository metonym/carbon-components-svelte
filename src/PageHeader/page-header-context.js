// @ts-check
import { createContext } from "svelte";

/**
 * What `PageHeader` gives the `Tabs` in its header, and its body.
 * `PageHeaderBody` provides `undefined`, so `Tabs` nested in a panel stay
 * on their own.
 * @typedef {object} PageHeaderContext
 * @property {(context: import("../Tabs/tabs-context.js").TabsContext) => undefined | { getBody: () => HTMLElement | null; setType: (type: "default" | "container") => void; unregister: () => void }} registerTabs
 *   Registers the header's `Tabs`; `undefined` when another `Tabs` already did.
 * @property {() => undefined | import("../Tabs/tabs-context.js").TabsContext} getTabs
 */

/** @type {[() => PageHeaderContext | undefined, (context: PageHeaderContext | undefined) => PageHeaderContext | undefined, () => boolean]} */
export const [getPageHeader, setPageHeader, hasPageHeader] = createContext();
