<script>
  /**
   * @template {string} [Value=string]
   * @restProps {input}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Set to `true` to select the tile.
     * In a `SelectableTileGroup`, follows the group's `selected`.
     */
    selected = $bindable(false),

    /**
     * Set the size: `"sm"` for a compact tile, such as a row in a list of
     * choices, with less padding, no minimum height, and the checkbox
     * pulled in. Defaults to the size of a parent tile group.
     * @type {"sm" | "md" | undefined}
     */
    size = undefined,

    /** Set to `true` to disable the tile */
    disabled = false,

    /** Set to `true` to stretch the tile to fill the height of its container */
    fullHeight = false,

    /**
     * Set to `true` to round the tile's corners when it has a `decorator`,
     * such as an `AILabel`. Carbon reserves rounded tiles for AI content.
     */
    rounded = false,

    /**
     * Specify the value of the selectable tile.
     * @type {Value}
     */
    value = /** @type {Value} */ ("value"),

    /**
     * Specify the tabindex
     * @type {number | string | undefined}
     */
    tabindex = "0",

    /**
     * Specify the title of the checkbox icon, shown as a tooltip on hover.
     * The icon is hidden from assistive technology.
     */
    iconDescription = "Tile checkmark",

    /**
     * Set an id for the input element
     * @type {string}
     */
    id = fallbackId,

    /**
     * Specify a name attribute for the input.
     * @type {string}
     */
    name = "",

    /**
     * Specify the id of a form element outside the component to associate
     * the checkbox with.
     * @type {string | undefined}
     */
    form = undefined,

    /**
     * Obtain a reference to the input HTML element.
     * @type {null | HTMLInputElement}
     */
    ref = $bindable(null),

    /**
     * Called when the user selects or deselects a standalone tile. In a
     * `SelectableTileGroup`, the group's `onselectedchange` reports instead.
     * Not called when `selected` is set from outside.
     * @type {((detail: { selected: boolean; id: string; value: Value }) => void) | undefined}
     */
    onselectedchange = undefined,

    /**
     * The tile content.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /**
     * A decorator beside the tile, such as an `AILabel`.
     * @type {import("svelte").Snippet | undefined}
     */
    decorator = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLInputElement> | undefined | null} */
    onclick = undefined,

    /** @type {import("svelte/elements").EventHandler<Event, HTMLInputElement> | undefined | null} */
    onchange = undefined,

    /** @type {import("svelte/elements").KeyboardEventHandler<HTMLInputElement> | undefined | null} */
    onkeydown = undefined,

    ...rest
  } = $props();

  import { onMount, untrack } from "svelte";
  import { writable } from "svelte/store";
  import CheckboxCheckedFilled from "../icons/CheckboxCheckedFilled.svelte";
  import CheckboxIcon from "../icons/CheckboxIcon.svelte";
  import { fieldsetDisabled } from "../utils/fieldset-disabled.js";
  import { formReset } from "../utils/form-reset.js";
  import TileWrapper from "./TileWrapper.svelte";
  import {
    getSelectableTileGroup,
    hasSelectableTileGroup,
  } from "./tile-group-context.js";

  const ctx = hasSelectableTileGroup() ? getSelectableTileGroup() : undefined;

  const effectiveSize = $derived(size ?? ctx?.size);

  // A disabled group disables the input natively through its fieldset;
  // mirror that in the tile's styling and tab order. The `disabled`
  // attribute stays the tile's own.
  // A disabled `<fieldset>` around the component disables it too.
  let inDisabledFieldset = $state(false);
  const effectiveDisabled = $derived(
    disabled || !!ctx?.disabled || inDisabledFieldset,
  );

  // In a group, the group's selection decides.
  const isSelected = $derived(ctx ? ctx.selected.includes(value) : selected);

  if (ctx) {
    // A tile that starts selected adds its value to the group.
    untrack(() => {
      if (selected) ctx.set(value, true);
    });
    let release = untrack(() => ctx.register(value));
    let prevValue = untrack(() => value);
    $effect.pre(() => {
      const next = value;
      untrack(() => {
        if (next === prevValue) return;
        // A selected tile carries the selection to its new value.
        const wasSelected = ctx.selected.includes(prevValue);
        ctx.set(prevValue, false);
        if (wasSelected) ctx.set(next, true);
        release();
        release = ctx.register(next);
        prevValue = next;
      });
    });
    onMount(() => () => release());

    // Keep `bind:selected` on the group's state.
    $effect.pre(() => {
      const next = isSelected;
      untrack(() => {
        if (selected !== next) selected = next;
      });
    });
  }

  // Captured from the checkbox's `click` event, which fires before `change`,
  // so the group knows whether Shift was held for range selection.
  let pendingShiftKey = false;

  /**
   * Route a change to whatever owns the selection.
   * @param {boolean} nextSelected
   * @param {boolean} user
   */
  function commit(nextSelected, user) {
    if (ctx) {
      if (user) ctx.toggle(value, nextSelected, pendingShiftKey);
      else ctx.set(value, nextSelected);
      return;
    }
    selected = nextSelected;
    if (user) onselectedchange?.({ selected: nextSelected, id, value });
  }

  // A form reset restores the checkbox without a change event. Sync the
  // state to it and call no callback, like the other form controls.
  function handleFormReset() {
    if (!ref) return;
    commit(ref.checked, false);
  }

  /** @param {Event & { currentTarget: EventTarget & HTMLInputElement }} event */
  function handleChange(event) {
    commit(event.currentTarget.checked, true);
    pendingShiftKey = false;
    onchange?.(event);
  }

  /** @param {KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }} event */
  function handleKeydown(event) {
    onkeydown?.(event);
    if (event.key !== "Enter") return;
    event.preventDefault();
    // Toggle once per press, like Space; a held key would otherwise
    // toggle on every auto-repeat.
    if (event.repeat) return;
    // Dispatching (rather than `ref.click()`) lets Shift be forwarded onto
    // the resulting click, which still runs the checkbox's native
    // pre-click activation (toggle + a follow-up "change").
    event.currentTarget.dispatchEvent(
      new MouseEvent("click", {
        shiftKey: event.shiftKey,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  /**
   * Starts active with a decorator, so the server renders the AI surface.
   * `Decorator` clears it when no `AILabel` claims the slot.
   * @type {import("svelte/store").Writable<undefined | "active" | "revert">}
   */
  const aiLabelState = writable(
    untrack(() => decorator) ? "active" : undefined,
  );
</script>

<TileWrapper
  {decorator}
  state={aiLabelState}
  class="bx--tile__wrapper--selectable"
>
  <input
    use:fieldsetDisabled={(value) => (inDisabledFieldset = value)}
    bind:this={ref}
    use:formReset={handleFormReset}
    type="checkbox"
    tabindex={effectiveDisabled ? undefined : tabindex}
    checked={isSelected}
    {id}
    {value}
    name={ctx?.name ?? name}
    form={ctx?.form ?? form}
    {disabled}
    {...rest}
    class={["bx--tile-input", className]}
    onclick={(event) => {
      pendingShiftKey = event.shiftKey;
      onclick?.(event);
    }}
    onchange={handleChange}
    onkeydown={handleKeydown}
  />
  <label
    for={id}
    class={[
      "bx--tile",
      "bx--tile--selectable",
      isSelected && "bx--tile--is-selected",
      effectiveSize === "sm" && "bx--tile--sm",
      effectiveDisabled && "bx--tile--disabled",
      fullHeight && "bx--tile--full-height",
      decorator && "bx--tile--decorator",
      rounded && decorator && "bx--tile--decorator-rounded",
      $aiLabelState === "active" && "bx--tile--ai-label",
    ]}
  >
    <span
      aria-hidden="true"
      class="bx--tile__checkmark bx--tile__checkmark--persistent"
    >
      {#if isSelected}
        <CheckboxCheckedFilled
          aria-label={iconDescription}
          title={iconDescription}
        />
      {:else}
        <CheckboxIcon aria-label={iconDescription} title={iconDescription} />
      {/if}
    </span>
    <span class="bx--tile-content">{@render children?.()}</span>
  </label>
</TileWrapper>
