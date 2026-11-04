<script>
  /**
   * Internal. Wraps an interactive tile when it has a `decorator`, so the
   * decorator sits beside the tile instead of inside its link, button, or
   * label.
   * @restProps {div}
   */
  let {
    /**
     * The decorator, such as an `AILabel`. Without it, the tile renders
     * unwrapped.
     * @type {import("svelte").Snippet | undefined}
     */
    decorator = undefined,

    /**
     * Receives the state of an `AILabel` in the decorator.
     * @type {import("svelte/store").Writable<undefined | "active" | "revert">}
     */
    state,

    /** @type {import("svelte").Snippet | undefined} */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import Decorator from "../AILabel/Decorator.svelte";
</script>

{#if decorator}
  <div {...rest} class={["bx--tile__wrapper--decorator", className]}>
    {@render children?.()}
    <Decorator class="bx--tile--inner-decorator" {state} labelSize="xs">
      {@render decorator()}
    </Decorator>
  </div>
{:else}
  {@render children?.()}
{/if}
