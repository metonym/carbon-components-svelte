<script>
  /**
   * @restProps {div}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Set an id for the panel.
     * Without one, the panel takes `{tabId}-panel` from the tab at its position.
     * Prefer a stable value when pairing panels with dynamic tabs.
     * @type {string | undefined}
     */
    id = undefined,

    /**
     * Set to `true` to defer mounting panel content until this tab is first selected
     */
    lazy = false,

    /**
     * Set to `true` to unmount panel content when the tab is deselected
     */
    unmountOnHide = false,

    /**
     * Set to `true` to remove the panel's horizontal padding so its content
     * lines up with the tab list's leading edge
     */
    flush = false,

    /**
     * The panel content.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-label": ariaLabel = undefined,

    ...rest
  } = $props();

  import { onMount, untrack } from "svelte";
  import { getTabs } from "./tabs-context.js";

  const ctx = getTabs();

  // Register while initializing, in render order, so the panel pairs with
  // the tab at its position from the first render, server included.
  let panelId = $state(untrack(() => ctx.addPanel(id, fallbackId)));
  onMount(() => () => ctx.removePanel(panelId));

  // An `id` set later replaces the registered one.
  $effect.pre(() => {
    const next = id;
    untrack(() => {
      if (next === undefined || next === panelId) return;
      ctx.renamePanel(panelId, next);
      panelId = next;
    });
  });

  const selected = $derived(ctx.isPanelSelected(panelId));
  const tabId = $derived(ctx.tabIdFor(panelId));

  let selectedOnce = $state(false);
  $effect.pre(() => {
    if (selected) untrack(() => (selectedOnce = true));
  });
  const shouldMount = $derived(
    unmountOnHide ? selected : lazy ? selected || selectedOnce : true,
  );
</script>

<div
  role="tabpanel"
  tabindex="0"
  aria-labelledby={ariaLabel ? undefined : tabId}
  aria-label={ariaLabel}
  aria-hidden={selected ? "false" : "true"}
  hidden={!selected}
  id={panelId}
  {...rest}
  class={["bx--tab-content", flush && "bx--tab-content--flush", className]}
>
  {#if shouldMount}
    {@render children?.()}
  {/if}
</div>
