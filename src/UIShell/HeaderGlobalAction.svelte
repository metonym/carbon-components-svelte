<script>
  /**
   * @template {import("../utils/icon-component.js").IconComponent} [Icon=any]
   * @extendProps {"../Button/Button.svelte"} ButtonProps
   */

  /** Set to `true` to use the active variant */
  export let isActive = false;

  /**
   * Specify the icon to render.
   * @type {Icon | undefined}
   */
  export let icon = /** @type {Icon | undefined} */ (undefined);

  /**
   * Obtain a reference to the HTML button element.
   * @type {null | HTMLButtonElement}
   * @bindable readonly
   */
  export let ref = null;

  import Button from "../Button/Button.svelte";

  $: buttonClass = [
    "bx--header__action",
    isActive && " bx--header__action--active",
    $$restProps.class,
  ]
    .filter(Boolean)
    .join(" ");

  import { createBubbler } from "svelte/legacy";

  // Re-dispatches a runes child's events to this component's `on:` listeners.
  const bubble = createBubbler();
</script>

{#if $$slots.badge}
  <div class:bx--btn__badge-wrapper={true}>
    <Button
      bind:ref
      {...$$restProps}
      class={buttonClass}
      size="lg"
      onclick={(e) => {
        $$restProps.onclick?.(e);
        bubble("click")(e);
      }}
    >
      {#snippet iconChildren()}<svelte:component
          this={icon}
          size={20}
        />{/snippet}
    </Button>
    <slot name="badge" />
  </div>
{:else}
  <Button
    bind:ref
    {...$$restProps}
    class={buttonClass}
    onclick={(e) => {
      $$restProps.onclick?.(e);
      bubble("click")(e);
    }}
  >
    {#snippet iconChildren()}<svelte:component
        this={icon}
        size={20}
      />{/snippet}
  </Button>
{/if}
