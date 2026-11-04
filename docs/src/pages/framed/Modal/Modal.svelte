<script>
  import { Button, Modal } from "carbon-components-svelte";

  let open = false;
</script>

<Button onclick={() => (open = true)}>Create database</Button>

<Modal
  bind:open
  modalHeading="Create database"
  primaryButtonText="Confirm"
  secondaryButtonText="Cancel"
  onsecondaryaction={() => (open = false)}
>
  <p>Create a new Cloudant database in the US South region.</p>
</Modal>
