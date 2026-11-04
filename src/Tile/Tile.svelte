<script>
  /**
   * @restProps {div}
   */
  let {
    /**
     * Set the size: `"sm"` for a compact tile, such as a row in a list of
     * choices, with less padding and no minimum height.
     * @type {"sm" | "md" | undefined}
     */
    size = undefined,

    /** Set to `true` to stretch the tile to fill the height of its container */
    fullHeight = false,

    /**
     * Set to `true` to round the tile's corners when it has a `decorator`,
     * such as an `AILabel`. Carbon reserves rounded tiles for AI content.
     */
    rounded = false,

    /** Set to `true` to remove the tile's padding */
    noPadding = false,

    /**
     * Obtain a reference to the top-level HTML element.
     * @type {null | HTMLDivElement}
     */
    ref = $bindable(null),

    /**
     * The tile content.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /**
     * A decorator in the tile's corner, such as an `AILabel`.
     * @type {import("svelte").Snippet | undefined}
     */
    decorator = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import { untrack } from "svelte";
  import { writable } from "svelte/store";
  import Decorator from "../AILabel/Decorator.svelte";

  /**
   * Starts active with a decorator, so the server renders the AI surface.
   * `Decorator` clears it when no `AILabel` claims the slot.
   * @type {import("svelte/store").Writable<undefined | "active" | "revert">}
   */
  const aiLabelState = writable(
    untrack(() => decorator) ? "active" : undefined,
  );
</script>

<div
  bind:this={ref}
  {...rest}
  class={[
    "bx--tile",
    size === "sm" && "bx--tile--sm",
    fullHeight && "bx--tile--full-height",
    noPadding && "bx--tile--no-padding",
    decorator && "bx--tile--decorator",
    rounded && decorator && "bx--tile--decorator-rounded",
    $aiLabelState === "active" && "bx--tile--ai-label",
    className,
  ]}
>
  {@render children?.()}
  {#if decorator}
    <Decorator
      class="bx--tile--inner-decorator"
      state={aiLabelState}
      labelSize="xs"
    >
      {@render decorator()}
    </Decorator>
  {/if}
</div>
