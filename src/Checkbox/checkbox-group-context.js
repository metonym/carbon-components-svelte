// @ts-check
import { createContext } from "svelte";

/**
 * What a `CheckboxGroup` gives its checkboxes. Every field is a getter over
 * the group's props, so a checkbox reads the current value without stores.
 * @typedef {object} CheckboxGroupContext
 * @property {ReadonlyArray<any>} selected
 * @property {string | undefined} name
 * @property {string | undefined} form
 * @property {boolean | undefined} required
 * @property {boolean} readonly
 * @property {boolean} disabled
 * @property {boolean} invalid
 * @property {boolean} warn
 * @property {(value: any, checked: boolean, fromReset?: boolean) => void} toggle
 */

/** @type {[() => CheckboxGroupContext, (context: CheckboxGroupContext) => CheckboxGroupContext, () => boolean]} */
export const [getCheckboxGroup, setCheckboxGroup, hasCheckboxGroup] =
  createContext();
