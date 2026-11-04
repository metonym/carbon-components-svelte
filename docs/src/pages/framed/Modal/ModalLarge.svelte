<script>
  import { Button, Modal } from "carbon-components-svelte";

  let open = false;
</script>

<Button onclick={() => (open = true)}>Create database</Button>

<Modal
  size="lg"
  bind:open
  modalHeading="Create database"
  primaryButtonText="Confirm"
  secondaryButtonText="Cancel"
>
  <p>Create a new Cloudant database in the US South region.</p>
</Modal>
