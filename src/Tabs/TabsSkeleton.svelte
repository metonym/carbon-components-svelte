<script>
  /**
   * @restProps {div}
   */
  let {
    /** Specify the number of tabs to render */
    count = 4,

    /**
     * Specify the type of tabs.
     * @type {"default" | "container"}
     */
    type = "default",

    /**
     * Specify the size to match a sized `Tabs`. Unset by default.
     * Line tabs (`type="default"`) support up to `"lg"`; container tabs
     * support up to `"xl"`. An out-of-range value clamps to the type's max.
     * @type {"sm" | "md" | "lg" | "xl" | undefined}
     */
    size = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import { resolveTabsSize } from "../utils/resolve-tabs-size.js";

  const resolvedSize = $derived(
    resolveTabsSize(size, type === "container" ? 3 : 2),
  );
</script>

<div
  {...rest}
  class={[
    "bx--tabs bx--skeleton bx--tabs--scrollable",
    type === "container" && "bx--tabs--scrollable--container",
    resolvedSize && `bx--layout--size-${resolvedSize}`,
    className,
  ]}
>
  <ul class="bx--tabs--scrollable__nav">
    {#each { length: count }, i}
      <li class="bx--tabs--scrollable__nav-item">
        <div class="bx--tabs__nav-link"><span></span></div>
      </li>
    {/each}
  </ul>
</div>
