<script>
  /**
   * @restProps {ul}
   */
  let {
    /** Specify the number of accordion items to render */
    count = 4,

    /**
     * Specify alignment of accordion item chevron icon.
     * @type {"start" | "end"}
     */
    align = "end",

    /**
     * Specify the size of the accordion.
     * Also accepts Carbon v11's `"md"` (the 40px default) and `"lg"` (`"xl"`).
     * @type {"sm" | "md" | "lg" | "xl" | undefined}
     */
    size = undefined,

    /**
     * Set to `true` to remove the gutter around the accordion, aligning it flush with its container.
     * Has no effect when `align` is `"start"`.
     */
    flush = false,

    /** Set to `false` to close the first accordion item */
    open = true,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import SkeletonText from "../SkeletonText/SkeletonText.svelte";
  import ChevronRight from "../icons/ChevronRight.svelte";
  import { FIELD_SIZE_ALIASES, normalizeSize } from "../utils/size-aliases.js";

  const effectiveSize = $derived(normalizeSize(size, FIELD_SIZE_ALIASES));
</script>

<ul
  {...rest}
  class={[
    "bx--skeleton bx--accordion",
    align === "start" && "bx--accordion--start",
    align === "end" && "bx--accordion--end",
    effectiveSize === "sm" && "bx--accordion--sm",
    effectiveSize === "xl" && "bx--accordion--xl",
    flush && align !== "start" && "bx--accordion--flush",
    className,
  ]}
>
  {#if open}
    <li class="bx--accordion__item bx--accordion__item--active">
      <span class="bx--accordion__heading">
        <ChevronRight class="bx--accordion__arrow" />
        <SkeletonText class="bx--accordion__title" />
      </span>
      <div class="bx--accordion__content">
        <SkeletonText width="90%" />
        <SkeletonText width="80%" />
        <SkeletonText width="95%" />
      </div>
    </li>
  {/if}
  {#each { length: open ? count - 1 : count }, i}
    <li class="bx--accordion__item">
      <span class="bx--accordion__heading">
        <ChevronRight class="bx--accordion__arrow" />
        <SkeletonText class="bx--accordion__title" />
      </span>
    </li>
  {/each}
</ul>
