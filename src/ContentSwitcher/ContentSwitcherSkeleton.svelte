<script>
  /**
   * @restProps {div}
   */
  let {
    /** Specify the number of switches */
    count = 3,

    /**
     * Specify the size of the content switcher it stands in for.
     * Also accepts Carbon v11's `"md"` (the 40px default) and `"lg"` (`"xl"`).
     * @type {"sm" | "md" | "lg" | "xl" | undefined}
     */
    size = undefined,

    /** Set to `true` to stand in for icon-only switches */
    iconOnly = false,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import { FIELD_SIZE_ALIASES, normalizeSize } from "../utils/size-aliases.js";

  const effectiveSize = $derived(normalizeSize(size, FIELD_SIZE_ALIASES));
</script>

<div
  {...rest}
  class={[
    "bx--content-switcher",
    effectiveSize === "sm" && "bx--content-switcher--sm",
    effectiveSize === "xl" && "bx--content-switcher--xl",
    iconOnly && "bx--content-switcher--icon-only",
    "bx--skeleton",
    className,
  ]}
>
  {#each Array.from({ length: count }, (_, i) => i) as item (item)}
    <span class="bx--content-switcher__skeleton-switch"></span>
  {/each}
</div>
