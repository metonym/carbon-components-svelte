<script>
  /**
   * @template {string} [T=string]
   * @restProps {fieldset}
   */

  const fallbackName = $props.id();

  let {
    /**
     * Specify the selected tile value.
     * Follows the field after a reset — becomes the value of whichever tile
     * is checked in the DOM, or `undefined`.
     * @type {T | undefined}
     */
    selected = $bindable(undefined),

    /** Set to `true` to disable the tile group */
    disabled = false,

    /**
     * Set to `true` to require the selection of a radio button.
     * @type {boolean | undefined}
     */
    required = undefined,

    /**
     * Specify a name attribute for the radio button inputs.
     * Overrides each tile's own `name`. When neither is set, the tiles share
     * a generated id so they form one radio group; set a name explicitly when
     * form submission matters.
     * @type {string | undefined}
     */
    name = undefined,

    /**
     * Specify the id of a form element outside the component to associate
     * the fieldset and radio tile inputs with. Overrides each tile's own `form`.
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
     * Called when the user checks a tile. Not called when `selected` is set
     * from outside or the form resets.
     * @type {((detail: { selected: T }) => void) | undefined}
     */
    onselectedchange = undefined,

    /**
     * The `RadioTile`s.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import { formReset } from "../utils/form-reset.js";
  import { setTileGroup } from "./tile-group-context.js";

  /** @type {HTMLFieldSetElement | null} */
  let fieldsetRef = $state(null);

  /**
   * How many mounted tiles carry each value.
   * @type {Map<T, number>}
   */
  const mountedValues = new Map();

  function handleFormReset() {
    if (!fieldsetRef) return;
    // formReset is task-deferred, so the browser has already restored every
    // tile's radio to its own default: checked when the markup carried a
    // `checked` attribute (server-rendered), unchecked otherwise. Read the
    // winner back, or none, and call no callback: a reset isn't a choice.
    // The input holds a string, so map it back to the tile's own value.
    const checkedInput = /** @type {HTMLInputElement | null} */ (
      fieldsetRef.querySelector('input[type="radio"]:checked')
    );
    selected = checkedInput
      ? ([...mountedValues.keys()].find(
          (value) => String(value) === checkedInput.value,
        ) ?? /** @type {T} */ (checkedInput.value))
      : undefined;
  }

  setTileGroup({
    get selected() {
      return selected;
    },
    get name() {
      return name || undefined;
    },
    // Unnamed radios are separate controls, so arrow keys would not move
    // between tiles. Tiles with no name share this one when the group has
    // none either.
    fallbackName,
    get form() {
      return form;
    },
    get required() {
      return required;
    },
    get disabled() {
      return disabled;
    },
    get size() {
      return size;
    },
    add(value, checked) {
      mountedValues.set(value, (mountedValues.get(value) ?? 0) + 1);
      if (checked) selected = value;
    },
    remove(value) {
      const count = (mountedValues.get(value) ?? 0) - 1;
      if (count > 0) mountedValues.set(value, count);
      else mountedValues.delete(value);
      // An `{#if}` swap or re-render destroys a tile before mounting its
      // replacement, so wait for the flush before deciding the value is gone.
      // Then drop a selection no radio carries anymore, as the browser does.
      queueMicrotask(() => {
        if (!mountedValues.has(value) && selected === value) {
          selected = undefined;
        }
      });
    },
    set(value) {
      selected = value;
    },
    select(value) {
      selected = value;
      onselectedchange?.({ selected: value });
    },
  });
</script>

{#snippet content(source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

<fieldset
  bind:this={fieldsetRef}
  use:formReset={handleFormReset}
  {disabled}
  {form}
  {...rest}
  class={["bx--tile-group", className]}
>
  {#if legendText}
    <legend class={["bx--label", hideLegend && "bx--visually-hidden"]}>
      {@render content(legendText)}
    </legend>
  {/if}
  <div>{@render children?.()}</div>
</fieldset>
