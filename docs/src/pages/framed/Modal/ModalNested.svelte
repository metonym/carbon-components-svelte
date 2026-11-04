<script>
  import { Button, Modal, Portal } from "carbon-components-svelte";

  let open = false;
  let openConfirm = false;
</script>

<Button kind="danger-tertiary" onclick={() => (open = true)}>
  Delete database
</Button>

<Modal
  danger
  bind:open
  modalHeading="Delete database"
  primaryButtonText="Delete"
  secondaryButtonText="Cancel"
  onsecondaryaction={() => (open = false)}
  onprimaryaction={() => (openConfirm = true)}
>
  <p>This will permanently delete the database and all of its data.</p>

  <Portal>
    <Modal
      danger
      size="xs"
      bind:open={openConfirm}
      modalHeading="Are you absolutely sure?"
      primaryButtonText="Delete forever"
      secondaryButtonText="Cancel"
      onsecondaryaction={() => (openConfirm = false)}
      onprimaryaction={() => {
        openConfirm = false;
        open = false;
      }}
    >
      <p>This action cannot be undone.</p>
    </Modal>
  </Portal>
</Modal>
