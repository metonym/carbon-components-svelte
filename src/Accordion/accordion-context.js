// @ts-check
import { createContext } from "svelte";

/**
 * What an `Accordion` gives its `AccordionItem`s. Fields are getters over
 * the accordion's state.
 * @typedef {object} AccordionContext
 * @property {boolean} disabled Whether the whole accordion is disabled.
 * @property {"single" | "multiple"} type
 * @property {object | null} openKey The item that owns the open slot when `type` is `"single"`.
 * @property {boolean} mounted Whether the accordion has mounted.
 * @property {(key: object) => void} setOpenKey
 * @property {(key: object) => void} release Gives up the open slot if `key` holds it.
 */

/** @type {[() => AccordionContext, (context: AccordionContext) => AccordionContext, () => boolean]} */
export const [getAccordion, setAccordion, hasAccordion] = createContext();
