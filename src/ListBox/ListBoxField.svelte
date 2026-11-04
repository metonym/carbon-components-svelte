<script>
  /**
   * @restProps {button}
   */

  const fallbackId = $props.id();

  let {
    /** Set to `true` to disable the list box field */
    disabled = false,

    /** Set to `true` to use the read-only variant */
    readonly = false,

    /** Specify the role attribute */
    role = "combobox",

    /**
     * Specify the tabindex
     * @type {number | string | undefined}
     */
    tabindex = "-1",

    /**
     * Set an id for the top-level element
     * @type {string}
     */
    id = fallbackId,

    /**
     * Obtain a reference to the top-level HTML element.
     * @type {null | HTMLButtonElement}
     */
    ref = $bindable(null),

    /** @type {import("svelte").Snippet | undefined} */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {boolean | "true" | "false" | undefined | null} */
    "aria-expanded": ariaExpanded = undefined,

    /** @type {import("svelte/elements").KeyboardEventHandler<HTMLButtonElement> | undefined | null} */
    onkeydown = undefined,

    ...rest
  } = $props();

  import { on } from "svelte/events";
  import {
    getMultiSelect,
    hasMultiSelect,
  } from "../MultiSelect/multi-select-context.js";

  const ctx = hasMultiSelect() ? getMultiSelect() : undefined;

  // Declare the node to a `MultiSelect`, and release that same node when it
  // goes away: `bind:this` has nulled `ref` by then.
  $effect(() => {
    const node = ref;
    if (!ctx || !node) return;
    ctx.declareRef({ key: "field", ref: node });
    return () => ctx.releaseRef({ key: "field", ref: node });
  });

  const expanded = $derived(ariaExpanded === true || ariaExpanded === "true");
</script>

<button
  bind:this={ref}
  type="button"
  {id}
  {role}
  aria-controls={expanded ? `menu-${id}` : undefined}
  aria-disabled={disabled ? "true" : "false"}
  aria-readonly={readonly ? "true" : undefined}
  aria-expanded={ariaExpanded}
  tabindex={disabled ? "-1" : tabindex}
  {...rest}
  class={["bx--list-box__field", className]}
  {@attach (node) =>
    // A listener on the element, not a delegated `onkeydown`, so it can stop
    // the event before an ancestor's own listener sees it. It runs the
    // consumer's `onkeydown` itself: a delegated one on this element would
    // run after the stop.
    on(node, "keydown", (event) => {
      onkeydown?.(event);
      // ListBox decides whether Escape propagates, based on the open state.
      if (event.key !== "Escape") event.stopPropagation();
    })}
>
  {@render children?.()}
</button>
