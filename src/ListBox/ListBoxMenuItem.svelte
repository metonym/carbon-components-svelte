<script>
  /**
   * @restProps {div}
   */
  let {
    /** Set to `true` to enable the active state */
    active = false,

    /** Set to `true` to enable the highlighted state */
    highlighted = false,

    /** Set to `true` to disable the menu item */
    disabled = false,

    /** Set to `true` to add inline padding for a left-aligned icon */
    hasLeftIcon = false,

    /**
     * Option element id. Used by the listbox highlight cursor.
     * @type {string | undefined}
     */
    id = undefined,

    /**
     * Hide the option without unmounting it (`filterMode="hide"`).
     * @type {boolean}
     */
    hidden = false,

    /** @type {import("svelte").Snippet | undefined} */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import { getContext } from "svelte";
  import { overflowTitle } from "../utils/overflow-title.js";
  import { scrollIntoViewWithin } from "../utils/scroll-into-view-within.js";
  import { HIGHLIGHT_CURSOR_KEY } from "./highlight-cursor.js";

  const HIGHLIGHT_CLASS = "bx--list-box__menu-item--highlighted";
  const highlightCursor = getContext(HIGHLIGHT_CURSOR_KEY);

  /** @type {null | HTMLDivElement} */
  let optionRef = $state(null);
  /** @type {null | HTMLDivElement} */
  let ref = $state(null);

  // Scroll the highlighted item into view for keyboard navigation, within
  // the menu's own scroll container, so a portaled menu (whose nearest
  // scrollable ancestor is the document) doesn't scroll the page.
  $effect(() => {
    if (!highlightCursor && highlighted && ref && !ref.matches(":hover")) {
      scrollIntoViewWithin(ref);
    }
  });

  // The highlight class isn't in the `class` attribute when the listbox
  // owns a cursor: the cursor writes it with `classList`, and a re-render
  // of the attribute would undo that. `--active` is a `class:` directive
  // for the same reason: it toggles one class instead of writing them all.
  $effect(() => {
    const node = optionRef;
    if (!node) return;
    if (highlightCursor) {
      return id ? highlightCursor.register(id, node) : undefined;
    }
    node.classList.toggle(HIGHLIGHT_CLASS, highlighted);
  });
</script>

<div
  bind:this={optionRef}
  {id}
  hidden={hidden || undefined}
  role="option"
  tabindex="-1"
  aria-selected={active ? "true" : "false"}
  aria-disabled={disabled ? "true" : undefined}
  disabled={disabled || undefined}
  {...rest}
  class={["bx--list-box__menu-item", className]}
  class:bx--list-box__menu-item--active={active}
>
  <div
    bind:this={ref}
    use:overflowTitle
    class={[
      "bx--list-box__menu-item__option",
      hasLeftIcon && "bx--list-box__menu-item__option--icon-left",
    ]}
  >
    {@render children?.()}
  </div>
</div>
