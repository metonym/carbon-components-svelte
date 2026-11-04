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

<Button onclick={() => (open = true)}>Create database</Button>

<ComposedModal size="sm" bind:open onprimaryaction={() => (open = false)}>
  <ModalHeader titleText="Create database" />
  <ModalBody>
    <p>Create a new Cloudant database in the US South region.</p>
  </ModalBody>
  <ModalFooter
    primaryButtonText="Confirm"
    secondaryButtonText="Cancel"
    onsecondaryaction={() => (open = false)}
  />
</ComposedModal>
