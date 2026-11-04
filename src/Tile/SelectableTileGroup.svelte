<script>
  /**
   * @template {string} [T=string]
   * @restProps {fieldset}
   */
  let {
    /**
     * Specify the selected tile values.
     * @type {T[]}
     */
    selected = $bindable([]),

    /** Set to `true` to disable the tile group */
    disabled = false,

    /**
     * Specify a name attribute for the checkbox inputs.
     * @type {string | undefined}
     */
    name = undefined,

    /**
     * Specify the id of a form element outside the component to associate
     * the fieldset and checkbox inputs with. Overrides each tile's own `form`.
     * @type {string | undefined}
     */
    form = undefined,

    /**
     * Specify the legend text, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    legendText = "",

    /** Set to `true` to visually hide the legend */
    hideLegend = false,

    /**
     * Set the size of every tile in the group: `"sm"` for compact tiles,
     * such as rows in a list of choices.
     * @type {"sm" | "md" | undefined}
     */
    size = undefined,

    /**
     * Called once per user toggle, or per Shift range, with every selected
     * value and the values that toggle added and removed. Not called when
     * `selected` is set from outside or the form resets.
     * @type {((detail: { selected: T[]; added: T[]; removed: T[] }) => void) | undefined}
     */
    onselectedchange = undefined,

    /**
     * The `SelectableTile`s.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import { rangeSlice } from "../utils/range-slice.js";
  import { setSelectableTileGroup } from "./tile-group-context.js";

  /** @type {HTMLFieldSetElement | null} */
  let fieldsetRef = $state(null);

  /**
   * Anchor value for Shift+click/Shift+keyboard range selection: the last
   * tile toggled, with or without Shift. `null` until the first toggle, or
   * once resolved to a value that no longer maps to a tile in the group.
   * @type {T | null}
   */
  let rangeAnchorValue = null;

  /**
   * The group's own tile `<input>` elements in DOM order. Queried live from the
   * DOM because tiles can be added, removed, or reordered dynamically.
   * @returns {HTMLInputElement[]}
   */
  function getOrderedInputs() {
    if (!fieldsetRef) return [];
    // Skip tiles that belong to a nested tile group (or radio tiles), whose
    // values aren't this group's to select.
    return Array.from(
      fieldsetRef.querySelectorAll('input[type="checkbox"].bx--tile-input'),
      (input) => /** @type {HTMLInputElement} */ (input),
    ).filter((input) => input.closest(".bx--tile-group") === fieldsetRef);
  }

  /**
   * The enabled tile values between the anchor tile and `value` (inclusive,
   * DOM order), or `null` when the anchor tile is no longer present, so the
   * caller can fall back to a single toggle.
   * @param {T} value
   * @returns {T[] | null}
   */
  function rangeValues(value) {
    const inputs = getOrderedInputs();
    const anchorIndex = inputs.findIndex(
      (input) => input.value === rangeAnchorValue,
    );
    const targetIndex = inputs.findIndex((input) => input.value === value);
    const range =
      targetIndex === -1 ? null : rangeSlice(inputs, anchorIndex, targetIndex);
    if (range === null) return null;
    return range
      .filter((input) => !input.disabled)
      .map((input) => /** @type {T} */ (input.value));
  }

  /**
   * How many mounted tiles use each value. Tiles that share a value share
   * one selection state, so selecting one selects them all.
   * @type {Map<T, number>}
   */
  const registeredValues = new Map();

  /** @type {Set<T>} */
  const warnedValues = new Set();

  /** True while Shift is held during a mousedown gesture inside the group; suppresses the browser's native Shift+click text-selection highlight spanning multiple tiles. */
  let shiftMouseActive = false;

  setSelectableTileGroup({
    get selected() {
      return selected;
    },
    get name() {
      return name;
    },
    get form() {
      return form;
    },
    get disabled() {
      return disabled;
    },
    get size() {
      return size;
    },
    register(value) {
      const count = (registeredValues.get(value) ?? 0) + 1;
      registeredValues.set(value, count);
      // The check waits for the current update to finish: tiles in a
      // non-keyed `{#each}` swap values one at a time, so a duplicate can
      // exist only mid-update.
      if (count === 2 && !warnedValues.has(value)) {
        queueMicrotask(() => {
          if (
            (registeredValues.get(value) ?? 0) < 2 ||
            warnedValues.has(value)
          ) {
            return;
          }
          warnedValues.add(value);
          console.warn(
            `[SelectableTileGroup.svelte] multiple tiles share the value "${value}", so they select together. Give each SelectableTile a unique \`value\`.`,
          );
        });
      }
      return () => {
        const remaining = (registeredValues.get(value) ?? 1) - 1;
        if (remaining > 0) registeredValues.set(value, remaining);
        else registeredValues.delete(value);
      };
    },
    set(value, isSelected) {
      const has = selected.includes(value);
      if (isSelected && !has) selected = [...selected, value];
      else if (!isSelected && has) {
        selected = selected.filter((v) => v !== value);
      }
    },
    toggle(value, isSelected, shiftKey) {
      const range =
        shiftKey && rangeAnchorValue !== null ? rangeValues(value) : null;
      const values = range ?? [value];
      const next = new Set(selected);
      /** @type {T[]} */
      const changed = [];
      for (const v of values) {
        if (isSelected && !next.has(v)) {
          next.add(v);
          changed.push(v);
        } else if (!isSelected && next.has(v)) {
          next.delete(v);
          changed.push(v);
        }
      }
      rangeAnchorValue = value;
      if (changed.length === 0) return;
      selected = [...next];
      onselectedchange?.({
        selected,
        added: isSelected ? changed : [],
        removed: isSelected ? [] : changed,
      });
    },
  });
</script>

{#snippet content(source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

<fieldset
  bind:this={fieldsetRef}
  {disabled}
  {form}
  {...rest}
  class={["bx--tile-group", className]}
  onmousedowncapture={(event) => {
    shiftMouseActive = event.shiftKey;
  }}
  onmouseupcapture={() => {
    shiftMouseActive = false;
  }}
  onselectstartcapture={(event) => {
    if (shiftMouseActive) event.preventDefault();
  }}
>
  {#if legendText}
    <legend class={["bx--label", hideLegend && "bx--visually-hidden"]}>
      {@render content(legendText)}
    </legend>
  {/if}
  <div>{@render children?.()}</div>
</fieldset>
