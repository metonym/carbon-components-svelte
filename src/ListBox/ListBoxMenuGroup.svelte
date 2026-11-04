<script>
  let {
    /**
     * Id of the element naming the group. When unset, the children render
     * without a wrapper, so ungrouped options stay direct children of the menu.
     * @type {string | undefined}
     */
    labelledBy = undefined,

    /** @type {import("svelte").Snippet | undefined} */
    children = undefined,
  } = $props();
</script>

{#if labelledBy}
  <div role="group" aria-labelledby={labelledBy}>{@render children?.()}</div>
{:else}
  {@render children?.()}
{/if}
