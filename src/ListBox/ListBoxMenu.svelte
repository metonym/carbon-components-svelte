<script>
  /**
   * @restProps {div}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Set an id for the top-level element
     * @type {string}
     */
    id = fallbackId,

    /**
     * Obtain a reference to the HTML element.
     * @type {null | HTMLDivElement}
     */
    ref = $bindable(null),

    /**
     * Set to `true` to render the menu in a portal,
     * allowing it to escape containers with `overflow: hidden`.
     * @type {boolean}
     */
    portal = false,

    /**
     * Set to `true` to open the floating portal.
     * Only used when `portal` is `true`.
     * @type {boolean}
     */
    open = false,

    /**
     * Specify the anchor element to position the portal relative to.
     * Only used when `portal` is `true`.
     * @type {null | HTMLElement}
     */
    anchor = null,

    /**
     * Specify the direction of the menu.
     * Only used when `portal` is `true`.
     * @type {"bottom" | "top"}
     */
    direction = /** @type {"bottom" | "top"} */ ("bottom"),

    /**
     * Specify which edge of the field the menu lines up with when it is wider
     * than the field, as the inline `Dropdown` menu is. `"end"` opens the menu
     * toward the start side instead of past the field's end.
     * @type {"start" | "end"}
     */
    align = /** @type {"start" | "end"} */ ("start"),

    /**
     * Class applied to a wrapper element inside the portal.
     * Only used when `portal` is `true`.
     * @type {string | undefined}
     */
    portalHostClass = undefined,

    /**
     * Set to `true` to let an option's label wrap onto as many lines as it
     * needs instead of being truncated with an ellipsis.
     * @type {boolean}
     */
    wrapOptions = false,

    /**
     * DOM id of the highlighted option (`{instanceId}-{item.id}`).
     * Applied as a two-node class change so `{#each}` does not re-run
     * every `ListBoxMenuItem` on ArrowDown.
     * @type {undefined | null | string}
     */
    highlightedId = undefined,

    /**
     * When `false`, skip scrolling the highlighted option into view
     * (pointer hover already has the item on screen).
     * @type {boolean}
     */
    highlightScroll = true,

    /** @type {import("svelte").Snippet | undefined} */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    style = undefined,

    ...rest
  } = $props();

  import { setContext } from "svelte";
  import FloatingPortal from "../Portal/FloatingPortal.svelte";
  import {
    createHighlightCursor,
    HIGHLIGHT_CURSOR_KEY,
  } from "./highlight-cursor.js";

  /** @type {ReturnType<typeof import("./highlight-cursor.js").createHighlightCursor>} */
  const highlightCursor = createHighlightCursor();
  setContext(HIGHLIGHT_CURSOR_KEY, highlightCursor);

  $effect.pre(() => {
    highlightCursor.set(highlightedId, { scroll: highlightScroll });
  });
</script>

{#snippet menu(/** @type {string | undefined | null} */ menuStyle)}
  <div
    bind:this={ref}
    role="listbox"
    id="menu-{id}"
    {...rest}
    style={menuStyle}
    class={[
      "bx--list-box__menu",
      align === "end" && "bx--list-box__menu--align-end",
      wrapOptions && "bx--list-box__menu--wrap-options",
      className,
    ]}
  >
    {@render children?.()}
  </div>
{/snippet}

{#if portal}
  <FloatingPortal {anchor} {direction} {open}>
    <div
      class={[
        portalHostClass,
        align === "end" && "bx--list-box__menu-host--align-end",
      ]}
    >
      {@render menu(`position: static; ${style || ""}`)}
    </div>
  </FloatingPortal>
{:else}
  {@render menu(style)}
{/if}
