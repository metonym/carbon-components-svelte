<script>
  import { Button, Modal, Tag } from "carbon-components-svelte";

  let open = false;
</script>

<Button onclick={() => (open = true)}>Create database</Button>

<Modal
  bind:open
  primaryButtonText="Confirm"
  secondaryButtonText="Cancel"
  onsecondaryaction={() => (open = false)}
>
  {#snippet modalLabel()}
    Cloudant <Tag type="green" size="sm">Beta</Tag>
  {/snippet}
  {#snippet modalHeading()}Create database{/snippet}
  <p>Create a new Cloudant database in the US South region.</p>
</Modal>
