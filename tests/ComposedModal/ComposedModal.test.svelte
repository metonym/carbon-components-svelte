<script lang="ts">
  import ComposedModal from "carbon-components-svelte/ComposedModal/ComposedModal.svelte";
  import ModalBody from "carbon-components-svelte/ComposedModal/ModalBody.svelte";
  import ModalFooter from "carbon-components-svelte/ComposedModal/ModalFooter.svelte";
  import ModalHeader from "carbon-components-svelte/ComposedModal/ModalHeader.svelte";
  import type { ComponentProps } from "svelte";

  export let open: ComponentProps<ComposedModal>["open"] = false;
  export let size: ComponentProps<ComposedModal>["size"] = undefined;
  export let danger: ComponentProps<ComposedModal>["danger"] = false;
  export let preventCloseOnClickOutside: ComponentProps<ComposedModal>["preventCloseOnClickOutside"] =
    undefined;
  export let containerClass: ComponentProps<ComposedModal>["containerClass"] =
    "";
  export let selectorPrimaryFocus: ComponentProps<ComposedModal>["selectorPrimaryFocus"] =
    "[data-modal-primary-focus]";

  export let headerTitle = "";
  export let headerLabel = "";
  export let bodyHasForm = false;
  export let bodyHasScrollingContent = false;
  export let footerPrimaryButtonText = "";
  export let footerPrimaryButtonDisabled = false;
  export let footerSecondaryButtonText = "";
  export let footerDanger = false;
  export let onclose: ComponentProps<ComposedModal>["onopenchange"] = undefined;
  export let ontransitionend: ComponentProps<ComposedModal>["onopenchangecomplete"] =
    undefined;
  export let includeInput = true;
  export let closeOnSubmit = false;
  export let includeBody = true;
</script>

<ComposedModal
  bind:open
  {size}
  {danger}
  {preventCloseOnClickOutside}
  class={containerClass}
  {selectorPrimaryFocus}
  onopenchange={(e) => onclose?.(e)}
  onopenchangecomplete={(e) => ontransitionend?.(e)}
  onprimaryaction={() => {
    if (closeOnSubmit) open = false;
  }}
  {...$$restProps}
>
  {#if headerTitle || headerLabel}
    <ModalHeader titleText={headerTitle} labelText={headerLabel} />
  {/if}
  {#if includeBody}
    <ModalBody
      hasForm={bodyHasForm}
      hasScrollingContent={bodyHasScrollingContent}
    >
      <slot />
      {#if includeInput}
        <input id="test-focus" data-testid="test-focus" />
      {/if}
    </ModalBody>
  {/if}
  {#if footerPrimaryButtonText || footerSecondaryButtonText}
    <ModalFooter
      primaryButtonText={footerPrimaryButtonText}
      primaryButtonDisabled={footerPrimaryButtonDisabled}
      secondaryButtonText={footerSecondaryButtonText}
      danger={footerDanger}
    />
  {/if}
</ComposedModal>
