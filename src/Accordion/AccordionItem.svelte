<script>
  /**
   * @restProps {button}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Specify the title of the accordion item heading, or a snippet.
     * @type {string | import("svelte").Snippet | undefined}
     */
    titleText = undefined,

    /** Set to `true` to open the accordion item. */
    open = $bindable(false),

    /** Set to `true` to disable the accordion item */
    disabled = false,

    /**
     * Obtain a reference to the heading button HTML element.
     * @type {null | HTMLButtonElement}
     */
    ref = $bindable(null),

    /**
     * Set to `true` to defer mounting the panel content until the item is first opened.
     * Once mounted, the content stays mounted for subsequent collapses.
     */
    lazy = false,

    /**
     * Set an id for the item's `<li>`.
     * The heading button and panel ids derive from it as `{id}-button` and
     * `{id}-content`.
     * @type {string}
     */
    id = fallbackId,

    /**
     * Called when the user opens or closes the item with its heading.
     * Not called when `open` is set from outside, or when another item's
     * opening closes this one.
     * @type {((detail: { open: boolean }) => void) | undefined}
     */
    onopenchange = undefined,

    /**
     * The panel content.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLButtonElement> | undefined | null} */
    onclick = undefined,

    ...rest
  } = $props();

  import { onMount, untrack } from "svelte";
  import ChevronRight from "../icons/ChevronRight.svelte";
  import { getAccordion, hasAccordion } from "./accordion-context.js";

  const ctx = hasAccordion() ? getAccordion() : undefined;

  /** This item's claim on the accordion's single open slot. */
  const key = {};

  // In a `"single"` accordion the first open item wins the first render; an
  // item added after mount with `open` takes over, as setting `open` on an
  // existing item does. Decided while initializing so the server agrees.
  untrack(() => {
    if (ctx?.type !== "single" || !open) return;
    if (ctx.mounted || ctx.openKey === null) ctx.setOpenKey(key);
    else open = false;
  });

  // Derived, not written back to `disabled`, so the item's own value
  // survives the accordion's `disabled` toggling on and off.
  const isDisabled = $derived(disabled || !!ctx?.disabled);

  $effect.pre(() => {
    if (isDisabled && open) untrack(() => (open = false));
  });

  // Opening takes the single slot.
  let prevOpen = untrack(() => open);
  $effect.pre(() => {
    const opened = open && !prevOpen;
    prevOpen = open;
    if (opened && ctx?.type === "single") untrack(() => ctx.setOpenKey(key));
  });

  // Another item took the slot: close. A free slot (the accordion just
  // became `"single"`) goes to the first open item.
  $effect.pre(() => {
    if (ctx?.type !== "single") return;
    const owner = ctx.openKey;
    untrack(() => {
      if (!open) return;
      if (owner === null) ctx.setOpenKey(key);
      else if (owner !== key) open = false;
    });
  });

  // A stale owner would force-close the next item mounted with `open`.
  onMount(() => () => ctx?.release(key));

  /** @type {undefined | "expanding" | "collapsing"} */
  let animation = $state(undefined);
  let openedOnce = $state(untrack(() => open));
  $effect.pre(() => {
    if (open) untrack(() => (openedOnce = true));
  });

  /** @param {MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }} event */
  function handleClick(event) {
    onclick?.(event);
    open = !open;
    animation = open ? "expanding" : "collapsing";
    onopenchange?.({ open });
  }
</script>

{#snippet content(/** @type {string | import("svelte").Snippet} */ source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

<li
  {id}
  class={[
    "bx--accordion__item",
    open && "bx--accordion__item--active",
    isDisabled && "bx--accordion__item--disabled",
    animation === "expanding" && "bx--accordion__item--expanding",
    animation === "collapsing" && "bx--accordion__item--collapsing",
  ]}
>
  <button
    bind:this={ref}
    id="{id}-button"
    type="button"
    aria-expanded={open}
    aria-controls="{id}-content"
    disabled={isDisabled}
    {...rest}
    class={["bx--accordion__heading", className]}
    onclick={handleClick}
  >
    <ChevronRight class="bx--accordion__arrow" />
    <div class="bx--accordion__title">
      {@render content(titleText ?? "")}
    </div>
  </button>
  <!-- Only the content animates; the target check ignores descendants'
       bubbled events. -->
  <div
    id="{id}-content"
    class="bx--accordion__content"
    onanimationend={(event) => {
      if (event.target === event.currentTarget) animation = undefined;
    }}
    role={open ? "region" : undefined}
    aria-labelledby={open ? `${id}-button` : undefined}
  >
    {#if !lazy || openedOnce}
      {@render children?.()}
    {/if}
  </div>
</li>
