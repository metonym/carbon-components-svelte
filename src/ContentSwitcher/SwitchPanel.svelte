<script>
  /**
   * @restProps {div}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Set an id for the panel element.
     * Prefer a stable value when switches are added or removed.
     * @type {string}
     */
    id = fallbackId,

    /**
     * Set to `true` to defer mounting panel content until its switch is first selected
     */
    lazy = false,

    /**
     * Set to `true` to unmount panel content when its switch is deselected
     */
    unmountOnHide = false,

    /**
     * Obtain a reference to the panel HTML element.
     * @type {null | HTMLDivElement}
     */
    ref = $bindable(null),

    /**
     * The panel content.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /** @type {string | undefined | null} */
    "aria-label": ariaLabel = undefined,

    ...rest
  } = $props();

  import { onMount, untrack } from "svelte";
  import { getContentSwitcher } from "./content-switcher-context.js";

  const ctx = getContentSwitcher();

  untrack(() => ctx.addPanel(id));
  onMount(() => () => ctx.removePanel(id));

  // Paired by position with the switch at the same index.
  const switchId = $derived(ctx.pairs.switchByPanel[id]);
  const selected = $derived(switchId !== undefined && ctx.currentId === switchId);
  let selectedOnce = $state(false);
  $effect.pre(() => {
    if (selected) selectedOnce = true;
  });
  const shouldMount = $derived(
    unmountOnHide ? selected : lazy ? selectedOnce || selected : true,
  );
</script>

<div
  bind:this={ref}
  role="tabpanel"
  tabindex="0"
  aria-label={ariaLabel}
  aria-labelledby={ariaLabel ? undefined : switchId}
  hidden={selected ? undefined : true}
  {id}
  {...rest}
>
  {#if shouldMount}
    {@render children?.()}
  {/if}
</div>
