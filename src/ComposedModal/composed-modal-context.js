// @ts-check
import { createContext } from "svelte";

/**
 * What a `ComposedModal` gives its header, body and footer. Fields are
 * getters over the modal's state.
 * @typedef {object} ComposedModalContext
 * @property {{ label: string; title: string; body: string }} ids Element ids for the header headings and the body.
 * @property {string | undefined} label The header's label text, once set.
 * @property {string | undefined} title The header's title text, once set.
 * @property {(label: string | undefined, title: string | undefined) => void} setHeading
 * @property {() => () => void} registerHeader Returns the unregister function.
 * @property {() => () => void} registerFooter A footer makes the modal transactional.
 * @property {(id: string | undefined) => void} setBodyId
 * @property {() => void} closeModal
 * @property {() => void} primaryAction
 */

/** @type {[() => ComposedModalContext, (context: ComposedModalContext) => ComposedModalContext, () => boolean]} */
export const [getComposedModal, setComposedModal, hasComposedModal] =
  createContext();
