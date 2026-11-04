// @ts-check
import { onMount } from "svelte";
import { readable, toStore } from "svelte/store";
import { noop } from "../utils/noop.js";
import { uniqueId } from "../utils/unique-id.js";
import { getTagSet, hasTagSet } from "./tag-set-context.js";

/**
 * What a tag registers with its `TagSet`, minus the id the set assigns.
 * @typedef {Omit<import("./tag-set-context.js").TagSetItem, "id">} TagSetMemberItem
 */

/**
 * The set's state as stores, so legacy and runes tags read it the same way.
 * @typedef {Object} TagSetMember
 * @property {import("svelte/store").Readable<"xs" | "sm" | "default" | "lg" | undefined>} size - The set's `size`.
 * @property {import("svelte/store").Readable<"tab" | "roving">} navigation - The set's `navigation`.
 * @property {import("svelte/store").Readable<boolean>} overflow - Whether the tag is collapsed into the "+N" indicator.
 * @property {import("svelte/store").Readable<0 | -1 | undefined>} tabindex - Roving `tabindex`; `undefined` keeps the native tab order.
 * @property {(patch: Partial<TagSetMemberItem>) => void} update - Sync changed fields to the set.
 * @property {() => void} notifyClose - Tell the set the tag's close button was clicked.
 */

/** @type {TagSetMember} */
const standalone = {
  size: readable(undefined),
  navigation: readable("tab"),
  overflow: readable(false),
  tabindex: readable(undefined),
  update: noop,
  notifyClose: noop,
};

/**
 * Join the parent `TagSet`, if any, so it can measure the tag, collapse it
 * into its "+N" indicator, and include it in roving focus. Call during
 * component init: the tag registers then, in document order, and reports
 * its element and label once mounted. Outside a set, returns inert stores
 * and no-op methods.
 *
 * @param {() => TagSetMemberItem} getItem - Read on mount, once the tag has rendered.
 * @returns {TagSetMember}
 */
export function joinTagSet(getItem) {
  const tagSet = hasTagSet() ? getTagSet() : undefined;
  if (!tagSet) return standalone;

  const id = uniqueId("ctag");

  // The tag's element and label exist only once it renders; register its
  // place now and fill them in on mount.
  tagSet.register({
    id,
    node: null,
    label: "",
    size: "default",
    disabled: false,
    filter: false,
  });
  onMount(() => {
    tagSet.update(id, getItem());
    return () => tagSet.unregister(id);
  });

  return {
    size: toStore(() => tagSet.size),
    navigation: toStore(() => tagSet.navigation),
    overflow: toStore(() => tagSet.isOverflow(id)),
    // A roving set owns the tab order: only its current tab stop is
    // tabbable. `undefined` until the set picks one, so server-rendered tags
    // keep their native order.
    tabindex: toStore(() =>
      tagSet.navigation === "roving" && tagSet.tabStopId !== null
        ? tagSet.tabStopId === id
          ? 0
          : -1
        : undefined,
    ),
    update: (patch) => tagSet.update(id, patch),
    notifyClose: () => tagSet.notifyClose(id),
  };
}
