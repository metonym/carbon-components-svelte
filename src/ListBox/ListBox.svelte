<script>
  /**
   * @restProps {div}
   */
  let {
    /**
     * Set the size of the list box.
     * Also accepts Carbon v11's `"md"` (the 40px default). `"lg"` and `"xl"`
     * are both 48px.
     * @type {"xs" | "sm" | "md" | "lg" | "xl" | undefined}
     */
    size = undefined,

    /**
     * Set the type of the list box.
     * @type {"default" | "inline"}
     */
    type = "default",

    /** Set to `true` to open the list box */
    open = false,

    /** Set to `true` to disable the list box */
    disabled = false,

    /** Set to `true` to indicate an invalid state */
    invalid = false,

    /** Specify the invalid state text */
    invalidText = "",

    /**
     * Specify an id for the invalid state text
     * @type {string | undefined}
     */
    invalidId = undefined,

    /** Set to `true` to indicate a warning state */
    warn = false,

    /** Specify the warning state text */
    warnText = "",

    /**
     * Specify an id for the warning state text
     * @type {string | undefined}
     */
    warnId = undefined,

    /** @type {import("svelte").Snippet | undefined} */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLDivElement> | undefined | null} */
    onclick = undefined,

    /** @type {import("svelte/elements").KeyboardEventHandler<HTMLDivElement> | undefined | null} */
    onkeydown = undefined,

    ...rest
  } = $props();

  import { on } from "svelte/events";
  import { isImeComposition } from "../utils/ime-composition.js";

  // Read in the capture phase, before the field's own handler closes the menu.
  let escapeClosesMenu = false;
</script>

<div
  tabindex="-1"
  data-invalid={invalid || undefined}
  {...rest}
  class={[
    "bx--list-box",
    size === "xs" && "bx--list-box--xs",
    size === "sm" && "bx--list-box--sm",
    size === "lg" && "bx--list-box--lg",
    size === "xl" && "bx--list-box--xl",
    type === "inline" && "bx--list-box--inline",
    disabled && "bx--list-box--disabled",
    open && "bx--list-box--expanded",
    !invalid && warn && "bx--list-box--warning",
    className,
  ]}
  onkeydowncapture={(event) => {
    // Escape that cancels an IME composition does not close the menu.
    escapeClosesMenu =
      event.key === "Escape" && open && !isImeComposition(event);
  }}
  {@attach (node) =>
    // A listener on the element, not a delegated `onkeydown`, so it can stop
    // the event before an ancestor's own listener sees it. It runs the
    // consumer's `onkeydown` itself: a delegated one on this element would
    // run after the stop.
    on(node, "keydown", (event) => {
      onkeydown?.(event);
      // An Escape that closes the menu stops here so an ancestor (Modal)
      // stays open. A closed list box has nothing to dismiss, so Escape
      // bubbles on.
      if (event.key === "Escape" && escapeClosesMenu) event.stopPropagation();
    })}
  onclick={(event) => {
    event.preventDefault();
    onclick?.(event);
  }}
>
  {@render children?.()}
</div>
{#if invalid && invalidText}
  <div id={invalidId} class="bx--form-requirement" role="alert">
    {invalidText}
  </div>
{/if}
{#if !invalid && warn && warnText}
  <div id={warnId} class="bx--form-requirement">{warnText}</div>
{/if}
