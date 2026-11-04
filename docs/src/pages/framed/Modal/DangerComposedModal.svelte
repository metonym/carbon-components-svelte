<script>
  import {
    Button,
    ComposedModal,
    ModalBody,
    ModalFooter,
    ModalHeader,
  } from "carbon-components-svelte";

  let open = false;
</script>

<Button kind="danger" onclick={() => (open = true)}>Delete all</Button>

<ComposedModal
  danger
  bind:open
  onprimaryaction={() => (open = false)}
>
  <ModalHeader titleText="Delete all instances" />
  <ModalBody>
    <p>This is a permanent action and cannot be undone.</p>
  </ModalBody>
  <ModalFooter primaryButtonText="Delete" secondaryButtonText="Cancel" danger />
</ComposedModal>
