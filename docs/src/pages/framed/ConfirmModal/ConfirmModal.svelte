<script>
  import { Button, ConfirmModal, Text } from "carbon-components-svelte";

  let open = false;
  let result = "";
</script>

<Button kind="danger" onclick={() => (open = true)}>Delete file</Button>

{#if result}
  <Text>Result: {result}</Text>
{/if}

<ConfirmModal
  bind:open
  titleText="Delete this file?"
  confirmText="Delete"
  onconfirm={() => (result = "confirmed")}
  onopenchange={(e) => (result = `canceled (${e.trigger})`)}
>
  <p>This action cannot be undone.</p>
</ConfirmModal>
