<script>
  import { Button, Modal } from "carbon-components-svelte";

  let open = false;
</script>

<Button kind="danger" onclick={() => (open = true)}>Delete all</Button>

<Modal
  danger
  bind:open
  modalHeading="Delete all instances"
  primaryButtonText="Delete"
  secondaryButtonText="Cancel"
  onsecondaryaction={() => (open = false)}
>
  <p>This is a permanent action and cannot be undone.</p>
</Modal>
