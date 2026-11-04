// @ts-check
import { createContext } from "svelte";

/**
 * What a tag registers with its `TagSet`.
 * @typedef {object} TagSetItem
 * @property {string} id
 * @property {HTMLElement | null | undefined} node
 * @property {string} label
 * @property {string | number} [value]
 * @property {string} [type]
 * @property {string} size
 * @property {boolean} disabled
 * @property {boolean} filter
 */

/**
 * What a `TagSet` gives its tags. Fields are getters over the set's state;
 * methods read it fresh, so a tag can ask while it registers.
 * `TagSetOverflow` and `TagSetAllTags` provide `undefined`, so the tags they
 * render don't join the set.
 * @typedef {object} TagSetContext
 * @property {"xs" | "sm" | "default" | "lg" | undefined} size The size tags without their own take.
 * @property {"tab" | "roving"} navigation
 * @property {string | null} tabStopId The tag that holds the roving tab stop; `null` until the set picks one.
 * @property {(item: TagSetItem) => void} register Registers a tag while it initializes.
 * @property {(id: string) => void} unregister
 * @property {(id: string, patch: Partial<Omit<TagSetItem, "id">>) => void} update
 * @property {(id: string) => boolean} isOverflow Whether the tag is collapsed into "+N".
 * @property {(id: string) => void} notifyClose The tag's close button was clicked.
 */

/** @type {[() => TagSetContext | undefined, (context: TagSetContext | undefined) => TagSetContext | undefined, () => boolean]} */
export const [getTagSet, setTagSet, hasTagSet] = createContext();
