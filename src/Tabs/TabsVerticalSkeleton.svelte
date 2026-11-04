<script>
  /**
   * @restProps {div}
   */
  let {
    /** Specify the number of tabs to render */
    count = 4,

    /**
     * Specify the orientation of the tab list.
     * By default, the tabs are a vertical column at the `md` breakpoint and up,
     * and collapse into a horizontal row below it.
     * Set to `"vertical"` to always render the column, or `"horizontal"` to
     * always render the row.
     * @type {"horizontal" | "vertical" | undefined}
     */
    orientation = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();
</script>

<div
  class={[
    "bx--tabs--vertical-container",
    orientation === undefined && "bx--tabs--vertical-container--responsive",
    orientation === "vertical" && "bx--tabs--vertical-container--column",
  ]}
>
  <div
    {...rest}
    class={[
      "bx--tabs bx--tabs--vertical bx--skeleton",
      orientation === undefined && "bx--tabs--vertical--responsive",
      orientation === "horizontal" && "bx--tabs--vertical--row",
      orientation === "vertical" && "bx--tabs--vertical--column",
      className,
    ]}
  >
    <ul class="bx--tabs__nav">
      {#each { length: count }, i}
        <li class="bx--tabs__nav-item">
          <div class="bx--tabs__nav-link"><span></span></div>
        </li>
      {/each}
    </ul>
  </div>
</div>
