<script>
  /**
   * @restProps {div}
   */
  let {
    /**
     * Specify the modal title, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    titleText = "",

    /**
     * Specify the modal label, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    labelText = "",

    /**
     * Specify the label of the close button.
     * It names the button and shows in its tooltip.
     */
    iconDescription = "Close",

    /**
     * Set to `true` to hide the header close button.
     * Provide an alternative dismiss path (footer actions or Escape).
     */
    hideCloseButton = false,

    /**
     * Content after the title, such as a description.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import { onMount, untrack } from "svelte";
  import Button from "../Button/Button.svelte";
  import Close from "../icons/Close.svelte";
  import { getComposedModal } from "./composed-modal-context.js";

  const modal = getComposedModal();

  // A snippet heading can't name the dialog as text; its id still does.
  /** @param {string | import("svelte").Snippet} value */
  const asText = (value) => (typeof value === "string" ? value : undefined);

  function syncHeading() {
    modal.setHeading(asText(labelText), asText(titleText));
  }

  // Set during init too, so the server names the dialog and its body.
  untrack(syncHeading);
  $effect.pre(syncHeading);
  // Register during init, not on mount: Svelte 5 unmounts a swapped-out
  // header before its replacement mounts, which would clear the new values.
  const unregisterHeader = modal.registerHeader();
  onMount(() => unregisterHeader);
</script>

{#snippet content(/** @type {string | import("svelte").Snippet} */ source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

<div {...rest} class={["bx--modal-header", className]}>
  {#if labelText}
    <h2 id={modal.ids.label} class="bx--modal-header__label bx--type-delta">
      {@render content(labelText)}
    </h2>
  {/if}
  {#if titleText}
    <h2 id={modal.ids.title} class="bx--modal-header__heading bx--type-beta">
      {@render content(titleText)}
    </h2>
  {/if}
  {@render children?.()}
  {#if !hideCloseButton}
    <div class="bx--modal-close-button">
      <Button
        kind="ghost"
        class="bx--modal-close"
        {iconDescription}
        aria-label={iconDescription}
        tooltipPosition="left"
        onclick={() => modal.closeModal()}
      >
        {#snippet iconChildren()}<Close
            size={20}
            class="bx--modal-close__icon"
            aria-hidden="true"
          />{/snippet}
      </Button>
    </div>
  {/if}
</div>
