// @ts-check
import { createContext } from "svelte";

/**
 * What a `MultiSelect` gives the `ListBoxField` and `ListBoxSelection` it
 * renders, so it can hold references to their elements.
 * @typedef {object} MultiSelectContext
 * @property {(data: { key: "field" | "selection"; ref: HTMLElement }) => void} declareRef
 * @property {(data: { key: "field" | "selection"; ref: HTMLElement }) => void} releaseRef
 *   Clears a reference unless a newer element was declared for the same key since.
 */

/** @type {[() => MultiSelectContext, (context: MultiSelectContext) => MultiSelectContext, () => boolean]} */
export const [getMultiSelect, setMultiSelect, hasMultiSelect] = createContext();
