<script>
  import {
    Button,
    ComposedModal,
    ModalBody,
    ModalFooter,
    ModalHeader,
  } from "carbon-components-svelte";
  import Send from "carbon-icons-svelte/lib/Send.svelte";

  let open = false;
</script>

<Button onclick={() => (open = true)}>Invite teammate</Button>

<ComposedModal bind:open onprimaryaction={() => (open = false)}>
  <ModalHeader titleText="Invite teammate" />
  <ModalBody>
    <p>An email invitation with a link to join the workspace will be sent.</p>
  </ModalBody>
  <ModalFooter
    primaryButtonText="Send invitation"
    primaryButtonIcon={Send}
    secondaryButtonText="Cancel"
    onsecondaryaction={() => (open = false)}
  />
</ComposedModal>
