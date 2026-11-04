<script>
  /**
   * @extendProps {"../Button/ButtonSkeleton.svelte"} ButtonSkeletonProps
   */

  /**
   * Specify the size of the skeleton, to match the ChatButton it stands in for.
   * Falls back to the height of a parent `Form`'s size, as ButtonSkeleton does.
   * @type {"default" | "field" | "small" | undefined}
   * @default "default"
   */
  export let size = undefined;

  import ButtonSkeleton from "../Button/ButtonSkeleton.svelte";

  import { createBubbler } from "svelte/legacy";

  // Re-dispatches a runes child's events to this component's `on:` listeners.
  const bubble = createBubbler();
</script>

<ButtonSkeleton
  {size}
  {...$$restProps}
  class={["bx--chat-btn", $$restProps.class].filter(Boolean).join(" ")}
  onclick={(e) => { $$restProps.onclick?.(e); bubble("click")(e); }}
  onfocus={(e) => { $$restProps.onfocus?.(e); bubble("focus")(e); }}
  onblur={(e) => { $$restProps.onblur?.(e); bubble("blur")(e); }}
  onmouseover={(e) => { $$restProps.onmouseover?.(e); bubble("mouseover")(e); }}
  onmouseenter={(e) => { $$restProps.onmouseenter?.(e); bubble("mouseenter")(e); }}
  onmouseleave={(e) => { $$restProps.onmouseleave?.(e); bubble("mouseleave")(e); }}
/>
