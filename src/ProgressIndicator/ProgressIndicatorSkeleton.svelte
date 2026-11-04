<script>
  /**
   * @restProps {ul}
   */
  let {
    /** Set to `true` to use the vertical variant */
    vertical = false,

    /** Set to `true` to specify whether the progress steps should be split equally in size in the div */
    spaceEqually = false,

    /** Specify the number of steps to render */
    count = 4,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();
</script>

<ul
  {...rest}
  class={[
    "bx--progress",
    vertical && "bx--progress--vertical",
    spaceEqually && !vertical && "bx--progress--space-equal",
    "bx--skeleton",
    className,
  ]}
>
  {#each { length: count }, i}
    <li class="bx--progress-step bx--progress-step--incomplete">
      <div
        class="bx--progress-step-button bx--progress-step-button--unclickable"
      >
        <svg>
          <path d="M 7, 7 m -7, 0 a 7,7 0 1,0 14,0 a 7,7 0 1,0 -14,0"></path>
        </svg>
        <p class="bx--progress-label"></p>
        <span class="bx--progress-line"></span>
      </div>
    </li>
  {/each}
</ul>
