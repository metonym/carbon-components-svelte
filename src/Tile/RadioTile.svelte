<script>
  /**
   * @template {string} [Value=string]
   * @restProps {input}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Set to `true` to check the tile.
     * In a `TileGroup`, follows the group's `selected`.
     */
    checked = $bindable(false),

    /**
     * Set the size: `"sm"` for a compact tile, such as a row in a list of
     * choices, with less padding, no minimum height, and the checkmark
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

    /** Set to `true` to mark the field as required */
    required = false,

    /**
     * Specify the value of the radio input.
     * @type {Value}
     */
    value = /** @type {Value} */ (""),

    /**
     * Specify the tabindex
     * @type {number | string | undefined}
     */
    tabindex = "0",

    /**
     * Specify the title for the radio tile checkmark icon.
     * The icon is hidden from assistive technology, so this only sets the
     * tooltip shown on hover.
     */
    iconDescription = "Tile checkmark",

    /**
     * Set an id for the input element
     * @type {string}
     */
    id = fallbackId,

    /**
     * Specify a name attribute for the radio tile input.
     * @type {string | undefined}
     */
    name = undefined,

    /**
     * Specify the id of a form element outside the component to associate
     * the radio input with.
     * @type {string | undefined}
     */
    form = undefined,

    /**
     * Obtain a reference to the input HTML element.
     * @type {null | HTMLInputElement}
     */
    ref = $bindable(null),

    /**
     * Called when the user checks the tile. Not called when `checked` is set
     * from outside, or when checking another tile unchecks this one.
     * @type {((detail: { checked: boolean }) => void) | undefined}
     */
    oncheckedchange = undefined,

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

    /** @type {import("svelte/elements").EventHandler<Event, HTMLInputElement> | undefined | null} */
    onchange = undefined,

    /** @type {import("svelte/elements").KeyboardEventHandler<HTMLInputElement> | undefined | null} */
    onkeydown = undefined,

    ...rest
  } = $props();

  import { onMount, untrack } from "svelte";
  import { writable } from "svelte/store";
  import {
    registerRadioButton,
    updateGroupSelection,
  } from "../RadioButton/radio-button-registry.js";
  import CheckmarkFilled from "../icons/CheckmarkFilled.svelte";
  import { fieldsetDisabled } from "../utils/fieldset-disabled.js";
  import { formReset } from "../utils/form-reset.js";
  import TileWrapper from "./TileWrapper.svelte";
  import { getTileGroup, hasTileGroup } from "./tile-group-context.js";

  const ctx = hasTileGroup() ? getTileGroup() : undefined;

  const effectiveSize = $derived(size ?? ctx?.size);

  // A disabled TileGroup disables the input natively through its fieldset;
  // mirror that in the tile's styling and tab order. The `disabled`
  // attribute stays the tile's own.
  // A disabled `<fieldset>` around the component disables it too.
  let inDisabledFieldset = $state(false);
  const effectiveDisabled = $derived(
    disabled || !!ctx?.disabled || inDisabledFieldset,
  );

  // In a group, the group's selection decides.
  const isChecked = $derived(ctx ? ctx.selected === value : checked);

  if (ctx) {
    untrack(() => ctx.add(value, checked));

    // A checked tile whose `value` changes carries the selection to the new
    // value, rather than leaving the group's `selected` naming a value no
    // radio has. Declared first, so it runs before `checked` re-derives
    // from the group against the new value.
    let prevValue = untrack(() => value);
    $effect.pre(() => {
      const next = value;
      untrack(() => {
        if (next === prevValue) return;
        if (ctx.selected === prevValue && checked) ctx.set(next);
        ctx.remove(prevValue);
        ctx.add(next, false);
        prevValue = next;
      });
    });

    // `checked` both selects this tile when set from outside and follows
    // the group's selection for `bind:checked`. Remember the last value on
    // each side to tell which one moved.
    let prevChecked = untrack(() => checked);
    $effect.pre(() => {
      if (checked === prevChecked) return;
      prevChecked = checked;
      untrack(() => {
        if (checked) ctx.set(value);
        else if (ctx.selected === value) ctx.set(undefined);
      });
    });
    $effect.pre(() => {
      const next = isChecked;
      untrack(() => {
        if (checked !== next) checked = prevChecked = next;
      });
    });
    onMount(() => () => ctx.remove(prevValue));
  } else {
    // Standalone tiles that share a `name` form a native radio group, which
    // unchecks the others without an event. Share the RadioButton registry
    // so a checked tile (by click or by prop) unchecks its siblings'
    // `checked`.
    const instanceKey = {};
    /** @type {null | ReturnType<typeof registerRadioButton>} */
    let registration = null;

    $effect(() => {
      const radioName = name;
      if (!radioName) return;
      const current = registerRadioButton(
        radioName,
        instanceKey,
        untrack(() => checked),
      );
      registration = current;
      // The store calls back at once; untracked, so a change to `checked`
      // doesn't re-register the tile.
      const unsubscribe = untrack(() =>
        current.selectedKey.subscribe((key) => {
          if (checked && key !== undefined && key !== instanceKey) {
            checked = false;
          }
        }),
      );
      return () => {
        unsubscribe();
        current.unregister();
        if (registration === current) registration = null;
      };
    });

    // Push only a false → true change: a tile that was already checked must
    // not reclaim the selection when its parent re-renders.
    let registeredChecked = untrack(() => checked);
    $effect.pre(() => {
      const next = checked;
      untrack(() => {
        if (registration && next && !registeredChecked && name) {
          updateGroupSelection(name, instanceKey);
        }
        registeredChecked = next;
      });
    });
  }

  // A form reset restores the radio without a change event. Inside
  // `TileGroup`, the group reads the result back; standalone, sync here.
  function handleFormReset() {
    if (ctx || !ref) return;
    checked = ref.checked;
  }

  /** @param {Event & { currentTarget: EventTarget & HTMLInputElement }} event */
  function handleChange(event) {
    if (ctx) ctx.select(value);
    else checked = event.currentTarget.checked;
    if (event.currentTarget.checked) oncheckedchange?.({ checked: true });
    onchange?.(event);
  }

  /** @param {KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }} event */
  function handleKeydown(event) {
    onkeydown?.(event);
    // Space is left to the native radio, which checks it and fires
    // `change`. Enter has no native radio behavior beyond implicit form
    // submission, so cancel that and click instead; an already-checked
    // radio fires no `change`, matching a pointer click.
    if (event.key === "Enter") {
      event.preventDefault();
      if (!event.currentTarget.checked) event.currentTarget.click();
    }
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

<TileWrapper {decorator} state={aiLabelState} class="bx--tile__wrapper--radio">
  <input
    use:fieldsetDisabled={(value) => (inDisabledFieldset = value)}
    bind:this={ref}
    use:formReset={handleFormReset}
    type="radio"
    {id}
    name={ctx ? (ctx.name ?? (name || ctx.fallbackName)) : name}
    form={ctx?.form ?? form}
    {value}
    checked={isChecked}
    tabindex={effectiveDisabled ? undefined : tabindex}
    {disabled}
    required={ctx?.required ?? required}
    {...rest}
    class={["bx--tile-input", className]}
    onchange={handleChange}
    onkeydown={handleKeydown}
  />
  <label
    for={id}
    class={[
      "bx--tile",
      "bx--tile--selectable",
      isChecked && "bx--tile--is-selected",
      effectiveSize === "sm" && "bx--tile--sm",
      effectiveDisabled && "bx--tile--disabled",
      fullHeight && "bx--tile--full-height",
      decorator && "bx--tile--decorator",
      rounded && decorator && "bx--tile--decorator-rounded",
      $aiLabelState === "active" && "bx--tile--ai-label",
    ]}
  >
    <span aria-hidden="true" class="bx--tile__checkmark">
      <CheckmarkFilled aria-label={iconDescription} title={iconDescription} />
    </span>
    <span class="bx--tile-content">{@render children?.()}</span>
  </label>
</TileWrapper>
