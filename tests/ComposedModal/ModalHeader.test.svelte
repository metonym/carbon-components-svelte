<script lang="ts">
  import ComposedModal from "carbon-components-svelte/ComposedModal/ComposedModal.svelte";
  import ModalBody from "carbon-components-svelte/ComposedModal/ModalBody.svelte";
  import ModalHeader from "carbon-components-svelte/ComposedModal/ModalHeader.svelte";
  import type { ComponentProps } from "svelte";

  export let open = true;
  export let title: ComponentProps<ModalHeader>["titleText"] = "";
  export let label: ComponentProps<ModalHeader>["labelText"] = "";
  export let iconDescription: ComponentProps<ModalHeader>["iconDescription"] =
    "Close";
  export let hideCloseButton = false;
  export let slotContent = "";
  export let onclick: (() => void) | undefined = undefined;
</script>

<ComposedModal bind:open>
  <ModalHeader
    titleText={title}
    labelText={label}
    {iconDescription}
    {hideCloseButton}
    onclick={() => onclick?.()}
    {...$$restProps}
  >
    {#if slotContent}
      {slotContent}
    {/if}
  </ModalHeader>
  <ModalBody>Content</ModalBody>
</ComposedModal>
